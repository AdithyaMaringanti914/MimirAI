import { LLMClient } from './LLMClient';
import { type SceneGraph } from '../domain/SceneGraph';
import { type Action } from '../domain/Action';
import { type Goal } from '../domain/Intent';

export class DynamicPlanner {
  public async determineNextAction(goal: Goal, currentScene: SceneGraph, history: string[]): Promise<Action | null> {
    const prompt = `
      You are the Dynamic Task Planner for an autonomous agent.
      Goal: ${goal.description}
      Constraints: ${goal.constraints.join(', ')}
      
      Execution History:
      ${history.join('\n') || 'None'}
      
      Current Scene Graph (UI State):
      ${JSON.stringify(currentScene, null, 2)}
      
      Based on the Goal and the Current Scene Graph, decide the NEXT SINGLE ACTION.
      If the goal is achieved, return an action of type "Wait" with ms=0 and a description of success.
      If you need to click an element, output "ClickCoordinates" and provide the x, y coordinates computed from the center of the element's bounding box in the Scene Graph.
      
      Return ONLY a JSON object matching the Action interface:
      {
        "type": "LaunchApplication|ClickCoordinates|TypeString|PressKey|Wait",
        "payload": { ... }
      }
    `;

    const responseStr = await LLMClient.ask(prompt, "You are a precise JSON-only output agent.");
    const action: Action = JSON.parse(responseStr);
    
    if (action.type === 'Wait' && action.payload?.ms === 0) {
      return null; // Indicates completion
    }

    return action;
  }
}
