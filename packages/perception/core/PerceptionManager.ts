import { ProviderRegistry } from '../providers/ProviderRegistry';
import { type ObservationContext, type ObservationResult, type PerceptionProvider } from '../core/types';
import { EventBus } from '../events/EventBus';
import { ConfidenceFusion } from '../fusion/ConfidenceFusion';
import { SceneGraphBuilder } from '../scenegraph/SceneGraphBuilder';
import { WorldModel } from '../world/WorldModel';
import { TelemetryManager } from '../telemetry/Telemetry';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { CancellationToken } from './CancellationToken';

export class PerceptionManager {
  
  public async initialize(ctx: ObservationContext) {
    // Listen for provider pushed events
    EventBus.subscribe('Win32Event', (payload) => {
      console.log(`[PerceptionManager] Fast-path Win32 update:`, payload.type);
      // Fast path: Immediately update world model for this specific window/element without full cycle
      // (Implementation of partial scene graph update)
      this.runObservationCycle(ctx, new CancellationToken()).catch(console.error);
    });

    EventBus.subscribe('UIAEvent', (payload) => {
      console.log(`[PerceptionManager] Fast-path UIA update:`, payload.type, payload.automationId);
      // Trigger a rapid cycle or partial update
      this.runObservationCycle(ctx, new CancellationToken()).catch(console.error);
    });
  }

  private async executeProviderWithTimeoutAndRetry(
    provider: PerceptionProvider, 
    ctx: ObservationContext, 
    token: CancellationToken
  ): Promise<ObservationResult | null> {
    const config = ConfigurationManager.getProviderConfig(provider.id());
    let attempts = 0;
    const maxAttempts = config.retry_count + 1;

    while (attempts < maxAttempts) {
      if (token.isCancellationRequested) return null;
      attempts++;
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after ${config.timeout_ms}ms`)), config.timeout_ms);
        });

        // Use Promise.race to enforce independent provider timeout
        const result = await Promise.race([
          provider.observe(ctx),
          timeoutPromise
        ]);

        TelemetryManager.recordSuccess(provider.id());
        return result as ObservationResult;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          TelemetryManager.recordFailure(provider.id(), err.message);
          EventBus.publish('ObservationFailed', { provider: provider.id(), reason: err.message });
          return null;
        }
        // Brief backoff before retry
        await new Promise(r => setTimeout(r, 100)); 
      }
    }
    return null;
  }

  public async runObservationCycle(ctx: ObservationContext, token: CancellationToken = new CancellationToken()) {
    const start = performance.now();
    EventBus.publish('ObservationStarted', { context: ctx });

    const activeProviders = ProviderRegistry.healthy();
    const capableProviders = [];

    for (const p of activeProviders) {
      if (await p.canObserve(ctx)) {
        capableProviders.push(p);
      }
    }

    // Execute providers concurrently with their specific configurations (timeout, retry)
    const promises = capableProviders.map(p => this.executeProviderWithTimeoutAndRetry(p, ctx, token));
    
    const resultsRaw = await Promise.all(promises);
    const validResults = resultsRaw.filter((r): r is ObservationResult => r !== null);

    // Fuse observations
    const fusedObservations = ConfidenceFusion.fuse(validResults);
    const windows = ctx.activeWindow ? [ctx.activeWindow] : [];

    const hash = crypto.randomUUID(); 
    const currentScene = SceneGraphBuilder.build(Date.now(), hash, fusedObservations, windows as any);
    const previousScene = WorldModel.getInstance().currentSceneGraph;

    EventBus.publish('SceneGraphUpdated', {
      current: currentScene,
      previous: previousScene,
      observations: fusedObservations
    });

    const latency = performance.now() - start;
    EventBus.publish('ObservationCompleted', { latency, providersUsed: validResults.map(r => r.provider) });
    console.log(`[PerceptionManager] Observation cycle completed in ${Math.round(latency)}ms`);
  }
}
