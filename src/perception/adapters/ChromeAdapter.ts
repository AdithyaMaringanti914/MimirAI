import { type SceneGraph } from '../../ai/domain/SceneGraph';
import { type Action } from '../../ai/domain/Action';
import { type Goal } from '../../ai/domain/Intent';

export class ChromeAdapter {
  
  public static tryDecideLocally(goal: Goal, scene: SceneGraph): Action | null {
    // Chrome adapter relies on CDP (Chrome DevTools Protocol).
    // For now, if the application is not Chrome, skip.
    if (!scene.application.toLowerCase().includes('chrome')) {
      return null;
    }

    // In a full implementation, this adapter would query CDP via the Go Agent.
    // Since we don't have CDP wired yet, we return null to fallback to generic UIA or Gemini.
    console.log('[ChromeAdapter] Chrome detected, but CDP not fully implemented yet. Skipping.');
    return null;
  }
}
