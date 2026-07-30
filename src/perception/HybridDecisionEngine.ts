import { SceneGraph } from '../ai/domain/SceneGraph';
import { Action } from '../ai/domain/Action';
import { Goal } from '../ai/domain/Intent';
import { GenericWindowsAdapter } from './adapters/GenericWindowsAdapter';
import { DynamicPlanner } from '../ai/engines/DynamicPlanner';

import { ChromeAdapter } from './adapters/ChromeAdapter';

export class HybridDecisionEngine {
  private dynamicPlanner = new DynamicPlanner();

  public async decide(goal: Goal, scene: SceneGraph, history: string[]): Promise<Action | null> {
    
    // 1. Try Application Specific Adapters (Zero API cost)
    const chromeAction = ChromeAdapter.tryDecideLocally(goal, scene);
    if (chromeAction) return chromeAction;

    // 2. Try local generic adapter
    const localAction = GenericWindowsAdapter.tryDecideLocally(goal, scene);
    if (localAction) return localAction;

    // 3. Fallback to Gemini if local logic is insufficient
    console.log('[HybridDecisionEngine] Local adapters insufficient. Falling back to Gemini Vision Reasoning.');
    return await this.dynamicPlanner.determineNextAction(goal, scene, history);
  }
}
