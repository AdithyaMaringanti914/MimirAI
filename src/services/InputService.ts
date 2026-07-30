import { RemoteInputManager } from '../managers/RemoteInputManager';
import { MouseButton, type MouseButtonEvent, type MouseMoveEvent, type MouseScrollEvent } from '../domain/MouseEvent';
import { type KeyboardEvent } from '../domain/KeyboardEvent';

export class InputService {
  private container: HTMLElement;
  private manager: RemoteInputManager;
  private isDragging = false;

  constructor(container: HTMLElement, manager: RemoteInputManager) {
    this.container = container;
    this.manager = manager;
  }

  public attach() {
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('dblclick', this.onDoubleClick);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
    this.container.addEventListener('contextmenu', this.onContextMenu);
    
    // Global keyboard listeners
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  public detach() {
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('dblclick', this.onDoubleClick);
    this.container.removeEventListener('wheel', this.onWheel);
    this.container.removeEventListener('contextmenu', this.onContextMenu);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private getCoordinates(e: MouseEvent) {
    const rect = this.container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private getMouseButton(e: MouseEvent): MouseButton {
    switch (e.button) {
      case 1: return MouseButton.MIDDLE;
      case 2: return MouseButton.RIGHT;
      case 0:
      default: return MouseButton.LEFT;
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    const coords = this.getCoordinates(e);
    const event: MouseMoveEvent = {
      type: this.isDragging ? 'mouse.dragMove' : 'mouse.move',
      timestamp: 0,
      x: coords.x,
      y: coords.y
    };
    this.manager.dispatchMouse(event);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    const coords = this.getCoordinates(e);
    const event: MouseButtonEvent = {
      type: 'mouse.down',
      timestamp: 0,
      x: coords.x,
      y: coords.y,
      button: this.getMouseButton(e)
    };
    this.manager.dispatchMouse(event);
  };

  private onMouseUp = (e: MouseEvent) => {
    const coords = this.getCoordinates(e);
    if (this.isDragging) {
      this.manager.dispatchMouse({
        type: 'mouse.dragEnd',
        timestamp: 0,
        x: coords.x,
        y: coords.y,
        button: this.getMouseButton(e)
      } as MouseButtonEvent);
    }
    this.isDragging = false;
    
    const event: MouseButtonEvent = {
      type: 'mouse.up',
      timestamp: 0,
      x: coords.x,
      y: coords.y,
      button: this.getMouseButton(e)
    };
    this.manager.dispatchMouse(event);
  };

  private onDoubleClick = (e: MouseEvent) => {
    const coords = this.getCoordinates(e);
    const event: MouseButtonEvent = {
      type: 'mouse.doubleClick',
      timestamp: 0,
      x: coords.x,
      y: coords.y,
      button: this.getMouseButton(e)
    };
    this.manager.dispatchMouse(event);
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault(); // Prevent page scroll
    const coords = this.getCoordinates(e);
    const event: MouseScrollEvent = {
      type: 'mouse.scroll',
      timestamp: 0,
      x: coords.x,
      y: coords.y,
      deltaX: e.deltaX,
      deltaY: e.deltaY
    };
    this.manager.dispatchMouse(event);
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault(); // Prevent local browser right click menu
  };

  private onKeyDown = (e: globalThis.KeyboardEvent) => {
    // Prevent default browser shortcuts like Alt+Tab etc. if we are focused
    if (this.isInputRestricted(e)) {
      e.preventDefault();
    }
    
    const event: KeyboardEvent = {
      type: 'keyboard.down',
      timestamp: 0,
      key: e.key,
      code: e.code,
      modifiers: {
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      }
    };
    this.manager.dispatchKeyboard(event);
  };

  private onKeyUp = (e: globalThis.KeyboardEvent) => {
    if (this.isInputRestricted(e)) {
      e.preventDefault();
    }

    const event: KeyboardEvent = {
      type: 'keyboard.up',
      timestamp: 0,
      key: e.key,
      code: e.code,
      modifiers: {
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      }
    };
    this.manager.dispatchKeyboard(event);
  };

  private isInputRestricted(e: globalThis.KeyboardEvent): boolean {
    // Prevent some default shortcuts (e.g. Ctrl+S, Ctrl+P) when remote controlling
    if (e.ctrlKey && ['s', 'p', 'd', 'g', 'j', 'o'].includes(e.key.toLowerCase())) return true;
    return false;
  }
}
