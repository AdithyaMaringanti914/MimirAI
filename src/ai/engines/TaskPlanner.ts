import { type Goal } from '../domain/Intent';
import { type Plan, type WorkflowNode } from '../domain/WorkflowNode';
import { LLMClient } from './LLMClient';

export class TaskPlanner {
  public async createPlan(goal: Goal): Promise<Plan> {
    const systemPrompt = `
      You are the Task Planner for a Remote Execution Agent.
      Convert the following Goal into a Directed Acyclic Graph (DAG) of executable WorkflowNodes.
      Return ONLY valid JSON matching this schema:
      {
        "nodes": [
          {
            "id": "unique-step-id",
            "name": "Short step name",
            "description": "What this step does",
            "dependencies": ["id-of-previous-step"],
            "action": {
              "type": "LaunchApplication|ExecuteShell|Wait",
              "payload": { ... }
            },
            "expectedResult": "Description of expected state",
            "timeoutMs": 5000,
            "retryPolicy": { "maxAttempts": 1, "delayMs": 1000 },
            "verificationRule": {
              "type": "ProcessRunning|None",
              "params": {}
            }
          }
        ]
      }
      Do NOT include mock steps. Make the steps sequential (each depends on the previous).
    `;

    const goalPrompt = JSON.stringify(goal);
    const responseStr = await LLMClient.ask(goalPrompt, systemPrompt);
    const parsed = JSON.parse(responseStr);

    const nodes: WorkflowNode[] = parsed.nodes.map((n: any) => ({
      ...n,
      status: 'pending',
      attempts: 0
    }));

    return {
      id: crypto.randomUUID(),
      goalId: goal.id,
      nodes,
      status: 'ready'
    };
  }
}
