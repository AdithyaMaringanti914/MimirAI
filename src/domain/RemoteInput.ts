export type InputEventType = 
  | 'mouse.move' | 'mouse.down' | 'mouse.up' | 'mouse.doubleClick' | 'mouse.scroll'
  | 'mouse.dragStart' | 'mouse.dragMove' | 'mouse.dragEnd'
  | 'keyboard.down' | 'keyboard.up'
  | 'clipboard.copy' | 'clipboard.paste'
  | 'cursor.position' | 'screen.resize'
  | 'ping' | 'pong';

export interface RemoteInput {
  type: InputEventType;
  timestamp: number;
}
