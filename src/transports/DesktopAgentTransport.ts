import { Packet } from '../protocol/Packet';
import { PacketValidator } from '../protocol/PacketValidator';
import { PacketSerializer } from '../protocol/PacketSerializer';
import { RemoteInput } from '../domain/RemoteInput';
import { SignalingManager } from '../services/connection/SignalingManager';

export class DesktopAgentTransport {
  private signaling: SignalingManager | null = null;
  private onPacketCb: ((packet: Packet) => void) | null = null;
  private onErrorCb: ((err: Error) => void) | null = null;
  
  private sessionId: string = '';
  private myDeviceId: string = '';
  private targetDeviceId: string = '';

  public attach(
    signaling: SignalingManager,
    sessionId: string,
    myDeviceId: string,
    targetDeviceId: string
  ) {
    this.signaling = signaling;
    this.sessionId = sessionId;
    this.myDeviceId = myDeviceId;
    this.targetDeviceId = targetDeviceId;

    // Listen to agent responses relayed by the backend
    this.signaling.onAgentResponse((data) => {
      if (data.sourceId !== this.targetDeviceId) return;
      this.handleMessage(data.response);
    });
  }

  public send(input: RemoteInput) {
    if (!this.signaling) return;

    try {
      const payload = PacketSerializer.serialize(this.sessionId, this.myDeviceId, input);
      this.signaling.sendAgentCommand({
        targetId: this.targetDeviceId,
        packet: payload
      });
    } catch (err) {
      console.error('[DesktopAgentTransport] Failed to serialize packet', err);
    }
  }

  private handleMessage(rawPacket: string) {
    try {
      const packet = PacketValidator.parseAndValidate(rawPacket);
      this.onPacketCb?.(packet);
    } catch (err) {
      console.warn('[DesktopAgentTransport] Dropped invalid packet:', err);
    }
  }

  public onPacket(cb: (packet: Packet) => void) {
    this.onPacketCb = cb;
  }

  public onError(cb: (err: Error) => void) {
    this.onErrorCb = cb;
  }

  public close() {
    this.signaling = null;
  }
}
