import { type RemoteInput } from './RemoteInput';

export interface KeyboardModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface KeyboardEvent extends RemoteInput {
  type: 'keyboard.down' | 'keyboard.up';
  key: string;
  code: string;
  modifiers: KeyboardModifiers;
}
