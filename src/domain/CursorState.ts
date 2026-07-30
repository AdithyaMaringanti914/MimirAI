import { type RemoteInput } from './RemoteInput';

export interface CursorState extends RemoteInput {
  type: 'cursor.position';
  x: number;
  y: number;
  visible: boolean;
  shape: string; // 'default', 'pointer', 'text', etc.
}
