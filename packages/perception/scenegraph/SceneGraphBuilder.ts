import { Observation, WindowInfo } from '../core/types';
import { SceneGraph } from '../../src/ai/domain/SceneGraph';
import { UIElement } from '../../src/ai/domain/SceneGraph';

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
