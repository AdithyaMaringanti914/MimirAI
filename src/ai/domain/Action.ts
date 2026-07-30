export type ActionType = 
  | 'LaunchApplication'
  | 'TerminateProcess'
  | 'ClickCoordinates'
  | 'ClickElement'
  | 'TypeString'
  | 'PressKey'
  | 'ReadClipboard'
  | 'ExecuteShell'
  | 'Wait'
  | 'CaptureScreenshot';

export interface Action {
  type: ActionType;
  payload: any;
}

export interface LaunchApplicationPayload {
  command: string;
  args?: string[];
}

export interface ClickCoordinatesPayload {
  x: number;
  y: number;
  button?: 'left' | 'right' | 'middle';
}

export interface TypeStringPayload {
  text: string;
}

export interface PressKeyPayload {
  key: string;
  modifiers?: string[];
}

export interface ExecuteShellPayload {
  command: string;
  args: string[];
}

export interface WaitPayload {
  ms: number;
}
