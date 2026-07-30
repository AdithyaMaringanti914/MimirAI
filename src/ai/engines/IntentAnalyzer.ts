import { Intent, Goal } from '../domain/Intent';
import { LLMClient } from './LLMClient';

export class IntentAnalyzer {
  public async analyze(rawText: string): Promise<Goal> {
    const systemPrompt = `
      You are an expert Intent Analyzer for a Remote Desktop Autonomous Agent.
      Convert the user's natural language request into a structured JSON Goal.
      JSON Format:
      {
        "description": "Clear actionable description",
        "constraints": ["List of constraints like 'Windows OS', 'No reboot'"],
        "successCriteria": ["List of observable states that prove success"]
      }
    `;

    const responseStr = await LLMClient.ask(rawText, systemPrompt);
    const parsed = JSON.parse(responseStr);

    return {
      id: crypto.randomUUID(),
      intentId: crypto.randomUUID(),
      description: parsed.description,
      constraints: parsed.constraints || [],
      successCriteria: parsed.successCriteria || []
    };
  }
}
