import type { Packet } from '../protocol/Packet';
import { PacketValidator } from '../protocol/PacketValidator';
import { PacketSerializer } from '../protocol/PacketSerializer';
import { type RemoteInput } from '../domain/RemoteInput';

export class RTCTransport {
  private channel: RTCDataChannel | null = null;
  private onPacketCb: ((packet: Packet) => void) | null = null;
  private onErrorCb: ((err: Error) => void) | null = null;
  private onStateChangeCb: ((state: RTCDataChannelState) => void) | null = null;

  private sessionId: string = '';
  private deviceId: string = '';

  public attach(channel: RTCDataChannel, sessionId: string, deviceId: string) {
    this.channel = channel;
    this.sessionId = sessionId;
    this.deviceId = deviceId;

    this.channel.onmessage = this.handleMessage.bind(this);
    
    this.channel.onopen = () => this.onStateChangeCb?.('open');
    this.channel.onclose = () => this.onStateChangeCb?.('closed');
    
    this.channel.onerror = (e) => {
      this.onErrorCb?.(new Error('RTCDataChannel Error'));
    };
  }

  public send(input: RemoteInput) {
    if (!this.channel || this.channel.readyState !== 'open') {
      return;
    }

    try {
      const payload = PacketSerializer.serialize(this.sessionId, this.deviceId, input);
      this.channel.send(payload);
    } catch (err) {
      console.error('[RTCTransport] Failed to serialize packet', err);
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const packet = PacketValidator.parseAndValidate(event.data);
      this.onPacketCb?.(packet);
    } catch (err) {
      console.warn('[RTCTransport] Dropped invalid packet:', err);
    }
  }

  public onPacket(cb: (packet: Packet) => void) {
    this.onPacketCb = cb;
  }

  public onError(cb: (err: Error) => void) {
    this.onErrorCb = cb;
  }

  public onStateChange(cb: (state: RTCDataChannelState) => void) {
    this.onStateChangeCb = cb;
  }

  public close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
