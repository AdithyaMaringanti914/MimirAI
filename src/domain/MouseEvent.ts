import { RemoteInput } from './RemoteInput';

export enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2
}

export interface MouseEventBase extends RemoteInput {
  x: number;
  y: number;
}

export interface MouseMoveEvent extends MouseEventBase {
  type: 'mouse.move' | 'mouse.dragMove';
}

export interface MouseButtonEvent extends MouseEventBase {
  type: 'mouse.down' | 'mouse.up' | 'mouse.doubleClick' | 'mouse.dragStart' | 'mouse.dragEnd';
  button: MouseButton;
}

export interface MouseScrollEvent extends MouseEventBase {
  type: 'mouse.scroll';
  deltaX: number;
  deltaY: number;
}
