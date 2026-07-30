import { PerceptionProvider, ObservationContext, ObservationResult, ProviderHealth, ProviderContext } from '../core/types';

export class GeminiVisionProvider implements PerceptionProvider {
  private _health = ProviderHealth.Ready;

  public id(): string { return 'GeminiVision'; }
  public name(): string { return 'Gemini Vision Provider'; }
  public version(): string { return '1.0.0'; }
  public priority(): number { return 5; }

  public async initialize(ctx: ProviderContext): Promise<void> {}

  public async health(): Promise<ProviderHealth> {
    return this._health;
  }

  public async canObserve(ctx: ObservationContext): Promise<boolean> {
    // Only observe if we have a screenshot and we explicitly trigger fallback
    return !!ctx.screenshot; 
  }

  public async observe(ctx: ObservationContext): Promise<ObservationResult> {
    const start = performance.now();
    // Stub: Normally calls LLMClient
    return {
      provider: this.id(),
      confidence: 0.90, // AI guess confidence
      latencyMs: performance.now() - start,
      observations: []
    };
  }

  public async shutdown(): Promise<void> {}
}
