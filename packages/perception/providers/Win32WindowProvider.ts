import { PerceptionProvider, ObservationContext, type ObservationResult, Observation, ProviderHealth, type ProviderContext } from '../core/types';
import WebSocket from 'ws';

export class Win32WindowProvider implements PerceptionProvider {
  private _health = ProviderHealth.Offline;
  private ws: WebSocket | null = null;
  private cachedWindows: any[] = [];
  private eventBus: any = null;

  public id(): string { return 'Win32Window'; }
  public name(): string { return 'Win32 Window Provider'; }
  public version(): string { return '1.0.0'; }
  public priority(): number { return 3; }

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
            this.eventBus?.publish('Win32Event', msg);
          }
        } catch (e) {
          console.error('[Win32WindowProvider] Invalid message', e);
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

  public async observe(ctx: ObservationContext): Promise<ObservationResult> {
    const obs: Observation[] = [];
    
    // We fetch the windows from Go Agent REST API or WebSocket for the actual observation cycle
    try {
      const res = await fetch('http://localhost:3000/api/system/windows'); // Assuming Go Agent exposes this if WS isn't full duplex
      if (res.ok) {
        const windows = await res.json();
        for (const w of windows) {
          obs.push({
            id: w.automationId || crypto.randomUUID(),
            type: 'Window',
            label: w.title,
            bounds: w.bounds,
            properties: { 
              className: w.className, 
              zOrder: w.zOrder,
              dpiScaling: w.dpiScaling,
              windowState: w.windowState
            },
            confidence: 1.0,
            provider: this.id()
          });
        }
      }
    } catch (err) {
      console.warn('[Win32WindowProvider] Failed to fetch windows', err);
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
