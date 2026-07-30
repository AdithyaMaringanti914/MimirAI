import type { Packet } from './Packet';
import { type RemoteInput } from '../domain/RemoteInput';

export class PacketSerializer {
  public static serialize(
    sessionId: string, 
    deviceId: string, 
    input: RemoteInput
  ): string {
    const packet: Packet = {
      version: '1.0',
      messageId: crypto.randomUUID(),
      timestamp: input.timestamp,
      sessionId,
      deviceId,
      type: input.type,
      payload: input
    };
    
    return JSON.stringify(packet);
  }
}
