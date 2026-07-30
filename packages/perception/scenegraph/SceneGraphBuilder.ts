import { type Observation, type WindowInfo } from '../core/types';
import { type SceneGraph } from '../../src/ai/domain/SceneGraph';
import { type UIElement } from '../../src/ai/domain/type SceneGraph';

export class SceneGraphBuilder {
  public static build(
    timestamp: number,
    hash: string,
    observations: Observation[],
    windows: WindowInfo[]
  ): SceneGraph {
    const controls: UIElement[] = [];
    const textBlocks: any[] = [];
    let application = 'Desktop';

    const topWin = windows.find(w => w.zOrder === 0);
    if (topWin) {
      application = topWin.title;
    }

    for (const obs of observations) {
      if (obs.type === 'Text') {
        textBlocks.push({
          text: obs.label,
          bounds: obs.bounds,
          confidence: obs.confidence
        });
      } else if (obs.type === 'Control') {
        controls.push({
          id: obs.id,
          type: obs.properties.controlType || 'button',
          label: obs.label,
          bounds: obs.bounds,
          confidence: obs.confidence
        });
      }
    }

    return {
      timestamp,
      frameId: crypto.randomUUID(),
      hash,
      application,
      controls,
      textBlocks,
      windows: windows as any[]
    };
  }
}
