/**
 * @file events.ts
 * @description Defines the full RTCDataChannel event protocol for the Mimir
 * remote desktop module. All messages sent over DataConnection are typed here.
 *
 * Protocol Design Principles:
 * - Every event carries a discriminant `type` field for exhaustive switching.
 * - Coordinates are ALWAYS normalized to 0.0–1.0 (never raw pixels).
 * - New event types (including future AI commands) extend this union without
 *   breaking existing consumers — open/closed principle.
 * - Timestamps are ISO-8601 strings for cross-platform compatibility.
 */

// ---------------------------------------------------------------------------
// Shared Primitives
// ---------------------------------------------------------------------------

/**
 * Normalized 2D coordinate. Values are always in the range [0.0, 1.0]
 * relative to the video element's rendered dimensions.
 */
export interface NormalizedPoint {
  /** Horizontal position as a fraction of total width */
  x: number;
  /** Vertical position as a fraction of total height */
  y: number;
}

/** Common modifier key state attached to keyboard and mouse events */
export interface ModifierKeys {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

// ---------------------------------------------------------------------------
// Mouse Events
// ---------------------------------------------------------------------------

export interface MouseMoveEvent {
  type: 'mouse:move';
  position: NormalizedPoint;
  timestamp: number;
}

export interface MouseDownEvent {
  type: 'mouse:down';
  position: NormalizedPoint;
  /** 0 = left, 1 = middle, 2 = right */
  button: 0 | 1 | 2;
  modifiers: ModifierKeys;
  timestamp: number;
}

export interface MouseUpEvent {
  type: 'mouse:up';
  position: NormalizedPoint;
  button: 0 | 1 | 2;
  modifiers: ModifierKeys;
  timestamp: number;
}

export interface MouseWheelEvent {
  type: 'mouse:wheel';
  position: NormalizedPoint;
  /** Horizontal scroll delta in logical pixels */
  deltaX: number;
  /** Vertical scroll delta in logical pixels */
  deltaY: number;
  timestamp: number;
}

export interface DoubleClickEvent {
  type: 'mouse:dblclick';
  position: NormalizedPoint;
  button: 0 | 1 | 2;
  modifiers: ModifierKeys;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Keyboard Events
// ---------------------------------------------------------------------------

export interface KeyDownEvent {
  type: 'key:down';
  /** The key value (e.g. "a", "Enter", "ArrowLeft") */
  key: string;
  /** The physical key code (e.g. "KeyA", "Enter") */
  code: string;
  modifiers: ModifierKeys;
  timestamp: number;
}

export interface KeyUpEvent {
  type: 'key:up';
  key: string;
  code: string;
  modifiers: ModifierKeys;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Clipboard & System Events
// ---------------------------------------------------------------------------

export interface ClipboardSyncEvent {
  type: 'clipboard:sync';
  /** Plain text clipboard content */
  text: string;
  /** Direction of sync: 'host-to-viewer' or 'viewer-to-host' */
  direction: 'host-to-viewer' | 'viewer-to-host';
  timestamp: number;
}

/** Heartbeat ping for latency measurement */
export interface PingEvent {
  type: 'ping';
  id: string;
  timestamp: number;
}

/** Pong response carries back the original ping timestamp */
export interface PongEvent {
  type: 'pong';
  id: string;
  originalTimestamp: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Input Events Union (current protocol)
// ---------------------------------------------------------------------------

export type RemoteInputEvent =
  | MouseMoveEvent
  | MouseDownEvent
  | MouseUpEvent
  | MouseWheelEvent
  | DoubleClickEvent
  | KeyDownEvent
  | KeyUpEvent;

// ---------------------------------------------------------------------------
// Full DataChannel Protocol (current + system)
// ---------------------------------------------------------------------------

/**
 * Complete discriminated union of all messages that may be sent over
 * the RTCDataChannel. New event types are added to this union as the
 * feature set grows — including future AI commands (see ai.ts).
 */
export type RemoteDataEvent =
  | RemoteInputEvent
  | ClipboardSyncEvent
  | PingEvent
  | PongEvent;

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

export function isMouseEvent(
  event: RemoteDataEvent
): event is MouseMoveEvent | MouseDownEvent | MouseUpEvent | MouseWheelEvent | DoubleClickEvent {
  return event.type.startsWith('mouse:');
}

export function isKeyboardEvent(
  event: RemoteDataEvent
): event is KeyDownEvent | KeyUpEvent {
  return event.type.startsWith('key:');
}
