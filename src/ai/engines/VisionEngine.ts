
import { type SceneGraph } from '../domain/SceneGraph';
import { executionBus } from '../bus/ExecutionBus';

export class VisionEngine {
  public async captureAndAnalyze(goalDescription: string): Promise<SceneGraph> {
    // 1. Capture screen from Native Agent
    const captureResult = await executionBus.dispatch({ type: 'CaptureScreenshot', payload: {} });
    if (!captureResult.success || !captureResult.base64Image) {
      throw new Error('Failed to capture screen: ' + captureResult.error);
    }

    const b64 = captureResult.base64Image;

    // 2. Prompt Gemini 1.5 Pro to act as OCR and UI Detector
    // We send the image inline.
    const prompt = `
      You are the Vision Perception Layer for an autonomous agent.
      The user's current goal is: "${goalDescription}"
      
      Analyze the provided screenshot of the desktop.
      Extract all relevant UI elements (buttons, textboxes, icons, checkboxes, window titles) and visible text.
      For each element, approximate its bounding box (x, y, width, height) relative to a 1920x1080 screen.
      If the exact resolution is unknown, assume 1920x1080 and estimate bounds as closely as possible.
      
      Return ONLY a JSON object matching this schema:
      {
        "application": "Name of the active application",
        "controls": [
          {
            "id": "unique-id",
            "type": "button|checkbox|textbox|icon|window_title",
            "label": "Visible text or description",
            "bounds": { "x": 100, "y": 100, "width": 50, "height": 20 },
            "confidence": 0.95
          }
        ],
        "textBlocks": [
          {
            "text": "Any other visible text",
            "bounds": { "x": 10, "y": 10, "width": 100, "height": 20 }
          }
        ]
      }
    `;

    // We must manually construct the Gemini API payload since LLMClient.ts currently only sends text.
    // Let's modify LLMClient.ts to support image parts if needed, or bypass it here.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: b64
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vision Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const jsonStr = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(jsonStr);

    return {
      timestamp: Date.now(),
      frameId: crypto.randomUUID(),
      hash: b64.substring(0, 32), // naive hash
      application: parsed.application || 'Desktop',
      controls: parsed.controls || [],
      textBlocks: parsed.textBlocks || []
    };
  }
}
