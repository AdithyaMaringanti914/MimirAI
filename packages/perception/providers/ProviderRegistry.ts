import { PerceptionProvider, ProviderHealth, ProviderContext } from '../core/types';
import { EventBus } from '../events/EventBus';
import { TelemetryManager } from '../telemetry/Telemetry';
import { ConfigurationManager } from '../config/ConfigurationManager';

export class ProviderRegistry {
  private static providers = new Map<string, PerceptionProvider>();
  private static healthCache = new Map<string, ProviderHealth>();
  private static failureCounts = new Map<string, number>();

  public static async register(provider: PerceptionProvider, context?: ProviderContext) {
    this.providers.set(provider.id(), provider);
    this.healthCache.set(provider.id(), ProviderHealth.Offline);
    this.failureCounts.set(provider.id(), 0);
    
    EventBus.publish('ProviderRegistered', { id: provider.id(), name: provider.name() });

    if (context) {
      try {
        await provider.initialize(context);
        this.healthCache.set(provider.id(), ProviderHealth.Ready);
        EventBus.publish('ProviderReady', { id: provider.id() });
      } catch (err) {
        this.healthCache.set(provider.id(), ProviderHealth.Offline);
        TelemetryManager.recordFailure(provider.id(), 'Initialization failed');
      }
    }
  }

  public static unregister(id: string) {
    this.providers.delete(id);
    this.healthCache.delete(id);
    this.failureCounts.delete(id);
  }

  public static get(id: string): PerceptionProvider | undefined {
    return this.providers.get(id);
  }

  public static list(): PerceptionProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.priority() - b.priority());
  }

  public static enabled(): PerceptionProvider[] {
    return this.list().filter(p => ConfigurationManager.getProviderConfig(p.id()).enabled);
  }

  public static healthy(): PerceptionProvider[] {
    return this.enabled().filter(p => {
      const health = this.healthCache.get(p.id());
      // Quarantine: exclude if completely offline or deeply degraded/failing repeatedly
      return health !== ProviderHealth.Offline;
    });
  }

  public static async checkHealth(id: string) {
    const provider = this.get(id);
    if (!provider) return;

    try {
      const currentHealth = await provider.health();
      const oldHealth = this.healthCache.get(id) || ProviderHealth.Offline;
      
      if (currentHealth !== oldHealth) {
        this.healthCache.set(id, currentHealth);
        TelemetryManager.recordHealthTransition(id, oldHealth, currentHealth);
        
        if (oldHealth === ProviderHealth.Offline && currentHealth === ProviderHealth.Ready) {
          EventBus.publish('ProviderRecovered', { id });
        }
      }
      
      if (currentHealth === ProviderHealth.Ready) {
        this.failureCounts.set(id, 0); // Reset on healthy
      }
    } catch (err) {
      this.healthCache.set(id, ProviderHealth.Offline);
      const count = (this.failureCounts.get(id) || 0) + 1;
      this.failureCounts.set(id, count);
      TelemetryManager.recordFailure(id, 'Health check failed');
    }
  }
}
