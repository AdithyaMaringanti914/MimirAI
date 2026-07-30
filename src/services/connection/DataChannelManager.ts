import { type DataMessage, DataMessageSchema } from './types/protocol';

export class DataChannelManager {
  private channel: RTCDataChannel | null = null;
  private onMessageCb: ((msg: DataMessage) => void) | null = null;

  public setChannel(channel: RTCDataChannel) {
    this.channel = channel;
    this.channel.onmessage = this.handleMessage.bind(this);
    this.channel.onopen = () => console.log('[DataChannel] Opened');
    this.channel.onclose = () => console.log('[DataChannel] Closed');
    this.channel.onerror = (e) => console.error('[DataChannel] Error', e);
  }

  public sendMessage(msg: DataMessage) {
    if (this.channel && this.channel.readyState === 'open') {
      try {
        const payload = JSON.stringify(msg);
        this.channel.send(payload);
      } catch (err) {
        console.error('[DataChannel] Failed to stringify message', err);
      }
    } else {
      console.warn('[DataChannel] Cannot send message, channel not open');
    }
  }

  public onMessage(cb: (msg: DataMessage) => void) {
    this.onMessageCb = cb;
  }

  private handleMessage(event: MessageEvent) {
    try {
      const parsed = JSON.parse(event.data);
      const validated = DataMessageSchema.parse(parsed);
      if (this.onMessageCb) {
        this.onMessageCb(validated);
      }
    } catch (err) {
      console.error('[DataChannel] Invalid message received', err);
    }
  }

  public close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
