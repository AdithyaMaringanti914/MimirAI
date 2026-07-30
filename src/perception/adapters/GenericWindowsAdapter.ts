import { SceneGraph } from '../../ai/domain/SceneGraph';
import { Action } from '../../ai/domain/Action';
import { Goal } from '../../ai/domain/Intent';
import { LLMClient } from '../../ai/engines/LLMClient';

export class GenericWindowsAdapter {
  
  public static tryDecideLocally(goal: Goal, scene: SceneGraph): Action | null {
    // A simple heuristic for this generic adapter:
    // If the goal mentions "click [label]" or "open [label]" and we have a UIA control with that label,
    // we can output the action locally without Gemini.
    
    const targetLabel = this.extractTargetLabel(goal.description);
    if (!targetLabel) return null;

    // Search for high confidence (UIA) controls matching the label
    const target = scene.controls.find(c => 
      c.confidence === 1.0 && 
      c.label.toLowerCase().includes(targetLabel.toLowerCase())
    );

    if (target) {
      console.log(`[GenericWindowsAdapter] Found target '${target.label}' locally via UIA! Bypassing Gemini.`);
      const x = Math.floor(target.bounds.x + target.bounds.width / 2);
      const y = Math.floor(target.bounds.y + target.bounds.height / 2);
      return {
        type: 'ClickCoordinates',
        payload: { x, y }
      };
    }

    return null;
  }

  private static extractTargetLabel(desc: string): string | null {
    const clickMatch = desc.match(/click (?:on )?['"]?([\w\s]+)['"]?/i);
    if (clickMatch) return clickMatch[1].trim();

    const openMatch = desc.match(/open ['"]?([\w\s]+)['"]?/i);
    if (openMatch) return openMatch[1].trim();

    return null;
  }
}
