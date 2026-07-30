export class LLMClient {
  private static get apiKey() {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  public static async ask(prompt: string, systemInstruction?: string, model: string = 'gemini-1.5-pro'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not defined in .env');
    }

    const payload: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini LLM Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
