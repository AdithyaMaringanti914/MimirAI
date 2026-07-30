import { type SceneGraph } from '../ai/domain/SceneGraph';
import { executionBus } from '../ai/bus/ExecutionBus';
import { FrameHasher } from './FrameHasher';
import { SceneGraphBuilder } from './SceneGraphBuilder';

export class PerceptionManager {
  private cachedScene: SceneGraph | null = null;

  public async getSceneGraph(): Promise<SceneGraph> {
    // 1. Capture screen, windows, and UIA from Native Agent
    const captureResult = await executionBus.dispatch({ type: 'CaptureScreenshot', payload: {} });
    if (!captureResult.success || !captureResult.base64Image) {
      throw new Error('Failed to capture screen: ' + captureResult.error);
    }

    const b64 = captureResult.base64Image;
    const hash = await FrameHasher.hash(b64);

    // 2. Cache check
    if (this.cachedScene && this.cachedScene.hash === hash) {
      console.log('[PerceptionManager] Frame unchanged. Returning cached Scene Graph.');
      return this.cachedScene;
    }

    // 3. Run OCR Locally via Python Service
    let ocrData = null;
    try {
      const formData = new FormData();
      formData.append('image', b64);
      
      const res = await fetch('http://127.0.0.1:8000/ocr', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        ocrData = await res.json();
      } else {
        console.warn('[PerceptionManager] Local OCR failed:', await res.text());
      }
    } catch (e) {
      console.warn('[PerceptionManager] Local OCR service unavailable. Start Python service on port 8000.');
    }

    // 4. Build Hybrid Scene Graph
    const scene = SceneGraphBuilder.build(
      Date.now(),
      crypto.randomUUID(),
      hash,
      captureResult.windows || [],
      captureResult.uiaRaw || null,
      ocrData
    );

    this.cachedScene = scene;
    return scene;
  }
}
