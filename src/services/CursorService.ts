import { type CursorState } from '../domain/CursorState';
import { CursorManager } from '../managers/CursorManager';

export class CursorService {
  private manager: CursorManager;
  private canvasElement: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(manager: CursorManager) {
    this.manager = manager;
  }

  public attach(canvasElement: HTMLElement) {
    this.canvasElement = canvasElement;
    this.unsubscribe = this.manager.onChange(this.onStateChanged.bind(this));
  }

  public detach() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.canvasElement = null;
  }

  private onStateChanged(state: CursorState) {
    if (!this.canvasElement) return;

    if (!state.visible) {
      this.canvasElement.style.cursor = 'none';
      return;
    }

    // A real implementation might use an image or standard CSS cursor map
    this.canvasElement.style.cursor = state.shape || 'default';
  }
}
