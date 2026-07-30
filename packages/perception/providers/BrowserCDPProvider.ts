import { PerceptionProvider, ObservationContext, ObservationResult, ProviderHealth, ProviderContext } from '../core/types';

export class BrowserCDPProvider implements PerceptionProvider {
  private _health = ProviderHealth.Ready;

  public id(): string { return 'BrowserCDP'; }
  public name(): string { return 'Browser CDP Provider'; }
  public version(): string { return '1.0.0'; }
  public priority(): number { return 2; }

  public async initialize(ctx: ProviderContext): Promise<void> {}

  public async health(): Promise<ProviderHealth> {
    return this._health;
  }

  public async canObserve(ctx: ObservationContext): Promise<boolean> {
    if (!ctx.activeWindow) return false;
    return ctx.activeWindow.title.toLowerCase().includes('chrome') || 
           ctx.activeWindow.title.toLowerCase().includes('edge');
  }

  public async observe(ctx: ObservationContext): Promise<ObservationResult> {
    return {
      provider: this.id(),
      confidence: 1.0,
      latencyMs: 10,
      observations: []
    };
  }

  public async shutdown(): Promise<void> {}
}
