import { RTCTransport } from '../transports/RTCTransport';
import { CoordinateNormalizer } from './CoordinateNormalizer';
import { type RemoteInput } from '../domain/RemoteInput';
import { type MouseEventBase, type MouseScrollEvent } from '../domain/MouseEvent';
import { type SessionPermissions } from '../domain/SessionPermissions';

export class RemoteInputManager {
  private transport: RTCTransport | null = null;
  public normalizer = new CoordinateNormalizer();
  
  private permissions: SessionPermissions = {
    canControlMouse: true,
    canControlKeyboard: true,
    canReadClipboard: true,
    canWriteClipboard: true
  };

  private lastMouseX = -1;
  private lastMouseY = -1;
  private mouseThrottleMs = 15; // Target <20ms
  private lastMouseTime = 0;

  public setTransport(transport: RTCTransport) {
    this.transport = transport;
  }

  public setPermissions(perms: SessionPermissions) {
    this.permissions = perms;
  }

  public dispatchMouse(event: MouseEventBase) {
    if (!this.permissions.canControlMouse || !this.transport) return;

    // Normalize coordinates
    const normalized = this.normalizer.normalize(event.x, event.y);
    event.x = normalized.x;
    event.y = normalized.y;

    // Throttle move events to prevent flooding
    if (event.type === 'mouse.move' || event.type === 'mouse.dragMove') {
      const now = Date.now();
      if (now - this.lastMouseTime < this.mouseThrottleMs) {
        return; // drop frame
      }
      this.lastMouseTime = now;
      this.lastMouseX = event.x;
      this.lastMouseY = event.y;
    }

    event.timestamp = Date.now();
    this.transport.send(event);
  }

  public dispatchKeyboard(event: RemoteInput) {
    if (!this.permissions.canControlKeyboard || !this.transport) return;
    event.timestamp = Date.now();
    this.transport.send(event);
  }

  public dispatchClipboard(event: RemoteInput) {
    if (!this.permissions.canWriteClipboard || !this.transport) return;
    event.timestamp = Date.now();
    this.transport.send(event);
  }
}
