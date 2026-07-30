import { PerceptionProvider, ObservationContext, ObservationResult, Observation, ProviderHealth, ProviderContext } from '../core/types';
import WebSocket from 'ws';

export class WindowsUIAProvider implements PerceptionProvider {
  private _health = ProviderHealth.Offline;
  private ws: WebSocket | null = null;
  private eventBus: any = null;

  public id(): string { return 'WindowsUIA'; }
  public name(): string { return 'Windows UI Automation Provider'; }
  public version(): string { return '1.0.0'; }
  public priority(): number { return 1; }

  public async initialize(ctx: ProviderContext): Promise<void> {
    this.eventBus = ctx.eventBus;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:4000/ws');
      
      this.ws.on('open', () => {
        this._health = ProviderHealth.Ready;
        resolve();
      });

      this.ws.on('error', (err) => {
        this._health = ProviderHealth.Offline;
        reject(err);
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'FocusChanged') {
            this.eventBus?.publish('UIAEvent', msg);
          }
        } catch (e) {
          console.error('[WindowsUIAProvider] Invalid message', e);
        }
      });
    });
  }
  
  public async health(): Promise<ProviderHealth> {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this._health = ProviderHealth.Offline;
    }
    return this._health;
  }

  public async canObserve(ctx: ObservationContext): Promise<boolean> {
    return this._health === ProviderHealth.Ready; 
  }

  private isSensitive(controlType: string, name: string, automationId: string): boolean {
    const lowerName = (name || '').toLowerCase();
    const lowerId = (automationId || '').toLowerCase();
    if (controlType.includes('Password') || lowerName.includes('password') || lowerId.includes('password')) {
      return true;
    }
    return false;
  }

  public async observe(ctx: ObservationContext): Promise<ObservationResult> {
    const obs: Observation[] = [];
    
    try {
      const res = await fetch('http://localhost:3000/api/system/uia');
      if (res.ok) {
        const uiaOutput = await res.text();
        
        // Very basic parsing for demonstration of integration. 
        // Real implementation would parse the complex JSON tree emitted by the PS script
        if (uiaOutput.startsWith('{') || uiaOutput.startsWith('[')) {
            const elements = JSON.parse(uiaOutput);
            for (const el of Array.isArray(elements) ? elements : [elements]) {
              const controlType = el.ControlType || 'Unknown';
              const name = el.Name || '';
              const isMasked = this.isSensitive(controlType, name, el.AutomationId);

              obs.push({
                  id: el.AutomationId || crypto.randomUUID(),
                  type: controlType,
                  label: isMasked ? '***' : name,
                  bounds: el.BoundingRectangle || { x: 0, y: 0, width: 0, height: 0 },
                  properties: {
                      isEnabled: el.IsEnabled ?? true,
                      isOffscreen: el.IsOffscreen ?? false,
                      hasKeyboardFocus: el.HasKeyboardFocus ?? false,
                      className: el.ClassName
                  },
                  confidence: 1.0,
                  provider: this.id()
              });
            }
        }
      }
    } catch (err) {
      console.warn('[WindowsUIAProvider] Failed to fetch UIA tree', err);
    }

    return {
      provider: this.id(),
      timestamp: Date.now(),
      observations: obs
    };
  }

  public async shutdown(): Promise<void> {
    this.ws?.close();
  }
}
