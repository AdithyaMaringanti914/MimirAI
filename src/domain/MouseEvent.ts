import { type RemoteInput } from './RemoteInput';

export const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
} as const;

export type MouseButton = typeof MouseButton[keyof typeof MouseButton];

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
