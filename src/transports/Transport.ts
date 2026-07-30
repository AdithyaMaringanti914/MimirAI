import { type RemoteInput } from '../domain/RemoteInput';
import { type Packet } from '../protocol/Packet';

export interface Transport {
  send(payload: RemoteInput | Packet | any): void;
  close(): void;
}
