export interface WindowInfo {
  id: string;
  title: string;
  className: string;
  bounds: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  zOrder: number;
}

export interface ObservationContext {
  screenshot?: Buffer | string; // Base64 string for now
  monitor: number;
  activeWindow?: WindowInfo;
  goal: string;
  workflowId: string;
}

export interface Observation {
  id: string;
  type: 'Window' | 'Control' | 'Text' | 'Dialog' | 'Cursor';
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  properties: Record<string, any>;
  confidence: number;
}

export interface ObservationResult {
  provider: string;
  confidence: number;
  latencyMs: number;
  observations: Observation[];
}

export const ProviderHealth = {
  Ready: 'Ready',
  Busy: 'Busy',
  Degraded: 'Degraded',
  Offline: 'Offline'
} as const;

export type ProviderHealth = typeof ProviderHealth[keyof typeof ProviderHealth];

export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  timeout_ms: number;
  retry_count: number;
  confidence_threshold: number;
}

export interface ProviderContext {
  logger: any; // In real implementation, this would be a proper logger interface
  eventBus: any;
  config: ProviderConfig;
  metrics: any;
  cache: any;
  worldModel: any; // Readonly reference
  cancellationToken: any;
}

export interface PerceptionProvider {
  id(): string;
  name(): string;
  version(): string;
  priority(): number;

  initialize(ctx: ProviderContext): Promise<void>;

  canObserve(ctx: ObservationContext): Promise<boolean>;

  observe(ctx: ObservationContext): Promise<ObservationResult>;

  health(): Promise<ProviderHealth>;

  shutdown(): Promise<void>;
}
