export interface TelemetryMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

export class TelemetryManager {
  private static metrics: TelemetryMetric[] = [];

  public static recordLatency(provider: string, ms: number) {
    this.metrics.push({ name: 'provider.latency', value: ms, tags: { provider }, timestamp: Date.now() });
  }

  public static recordSuccess(provider: string) {
    this.metrics.push({ name: 'provider.success', value: 1, tags: { provider }, timestamp: Date.now() });
  }

  public static recordFailure(provider: string, reason: string) {
    this.metrics.push({ name: 'provider.failure', value: 1, tags: { provider, reason }, timestamp: Date.now() });
    console.error(`[Telemetry] ${provider} failed: ${reason}`);
  }

  public static recordHealthTransition(provider: string, oldHealth: string, newHealth: string) {
    this.metrics.push({ name: 'provider.health_transition', value: 1, tags: { provider, oldHealth, newHealth }, timestamp: Date.now() });
    console.log(`[Telemetry] ${provider} transitioned from ${oldHealth} to ${newHealth}`);
  }

  public static recordCacheHit(cacheName: string, isHit: boolean) {
    this.metrics.push({ name: 'cache.hit_ratio', value: isHit ? 1 : 0, tags: { cache: cacheName }, timestamp: Date.now() });
  }

  public static recordGeminiCall(latencyMs: number) {
    this.metrics.push({ name: 'gemini.invocation', value: latencyMs, timestamp: Date.now() });
  }
}
