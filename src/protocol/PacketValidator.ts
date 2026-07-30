import { PacketSchema, type Packet } from './Packet';

export class PacketValidator {
  public static parseAndValidate(rawData: string): Packet {
    try {
      const parsed = JSON.parse(rawData);
      return PacketSchema.parse(parsed);
    } catch (err) {
      throw new Error(`Packet Validation Failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
