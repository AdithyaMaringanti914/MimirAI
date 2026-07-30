import { type ProviderConfig } from '../core/types';

export class ConfigurationManager {
  private static defaultConfigs: Record<string, ProviderConfig> = {
    'WindowsUIA': { enabled: true, priority: 1, timeout_ms: 1000, retry_count: 0, confidence_threshold: 0.9 },
    'BrowserCDP': { enabled: true, priority: 2, timeout_ms: 1000, retry_count: 0, confidence_threshold: 0.9 },
    'Win32Window': { enabled: true, priority: 3, timeout_ms: 500, retry_count: 1, confidence_threshold: 1.0 },
    'OCR': { enabled: true, priority: 4, timeout_ms: 3000, retry_count: 1, confidence_threshold: 0.8 },
    'GeminiVision': { enabled: true, priority: 5, timeout_ms: 10000, retry_count: 2, confidence_threshold: 0.8 }
  };

  private static configs = new Map<string, ProviderConfig>();

  public static getProviderConfig(providerId: string): ProviderConfig {
    if (this.configs.has(providerId)) {
      return this.configs.get(providerId)!;
    }
    return this.defaultConfigs[providerId] || { enabled: false, priority: 100, timeout_ms: 5000, retry_count: 0, confidence_threshold: 0.5 };
  }

  public static updateConfig(providerId: string, config: Partial<ProviderConfig>) {
    const current = this.getProviderConfig(providerId);
    this.configs.set(providerId, { ...current, ...config });
  }
}
