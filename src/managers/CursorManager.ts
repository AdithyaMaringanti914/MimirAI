import { CursorState } from '../domain/CursorState';

export class CursorManager {
  private currentState: CursorState = {
    type: 'cursor.position',
    timestamp: 0,
    x: 0,
    y: 0,
    visible: true,
    shape: 'default'
  };

  private listeners: ((state: CursorState) => void)[] = [];

  public updateState(newState: Partial<CursorState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.notify();
  }

  public getState(): CursorState {
    return this.currentState;
  }

  public onChange(cb: (state: CursorState) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentState));
  }
}
