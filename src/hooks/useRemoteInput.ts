/**
 * @file useRemoteInput.ts
 * @description Viewer-side hook for capturing mouse and keyboard input from
 * the remote canvas and transmitting events over RTCDataChannel.
 *
 * Features:
 *   - Normalizes all coordinates to [0.0–1.0] using InputNormalizer
 *   - Throttles mousemove events to avoid DataChannel saturation
 *   - Supports: mousemove, mousedown, mouseup, wheel, dblclick
 *   - Supports: keydown, keyup with modifier key state
 *   - Captures keyboard only when canvas has focus (tabIndex required)
 *   - Does NOT implement host-side event replay (OS automation)
 */

import { useCallback, useRef } from 'react';
import { InputNormalizer } from '../services/automation/InputNormalizer';
import type {
  RemoteDataEvent,
  MouseMoveEvent,
  MouseDownEvent,
  MouseUpEvent,
  MouseWheelEvent,
  DoubleClickEvent,
  KeyDownEvent,
  KeyUpEvent,
  ModifierKeys,
} from '../types/events';

// ---------------------------------------------------------------------------
// Hook Options
// ---------------------------------------------------------------------------

export interface UseRemoteInputOptions {
  /** Called with each normalized input event to transmit over DataChannel */
  onEvent: (event: RemoteDataEvent) => void;
  /** Whether input capture is active (e.g., disabled when disconnected) */
  enabled?: boolean;
  /** Mousemove throttle interval in ms. Default: 16ms (~60/s) */
  mouseMoveThrottleMs?: number;
}

// ---------------------------------------------------------------------------
// Hook Return Value
// ---------------------------------------------------------------------------

export interface UseRemoteInputReturn {
  /** Attach to the container div's onMouseMove */
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  /** Attach to the container div's onMouseDown */
  handleMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  /** Attach to the container div's onMouseUp */
  handleMouseUp: (e: React.MouseEvent<HTMLElement>) => void;
  /** Attach to the container div's onWheel */
  handleWheel: (e: React.WheelEvent<HTMLElement>) => void;
  /** Attach to the container div's onDoubleClick */
  handleDoubleClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Attach to the container div's onKeyDown */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Attach to the container div's onKeyUp */
  handleKeyUp: (e: React.KeyboardEvent<HTMLElement>) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractModifiers(
  e: React.MouseEvent | React.KeyboardEvent
): ModifierKeys {
  return {
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
  };
}

function getButton(e: React.MouseEvent): 0 | 1 | 2 {
  if (e.button === 1) return 1;
  if (e.button === 2) return 2;
  return 0;
}

// ---------------------------------------------------------------------------
// useRemoteInput Hook
// ---------------------------------------------------------------------------

export function useRemoteInput(options: UseRemoteInputOptions): UseRemoteInputReturn {
  const { onEvent, enabled = true, mouseMoveThrottleMs = 16 } = options;

  const lastMouseMoveTimeRef = useRef(0);

  // ---- Mouse Move (throttled) ------------------------------------------------

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;

      const now = Date.now();
      if (now - lastMouseMoveTimeRef.current < mouseMoveThrottleMs) return;
      lastMouseMoveTimeRef.current = now;

      const rect = e.currentTarget.getBoundingClientRect();
      const position = InputNormalizer.normalize(e.clientX, e.clientY, rect);

      if (!InputNormalizer.isInBounds(position)) return;

      const event: MouseMoveEvent = {
        type: 'mouse:move',
        position,
        timestamp: now,
      };
      onEvent(event);
    },
    [enabled, mouseMoveThrottleMs, onEvent]
  );

  // ---- Mouse Down ------------------------------------------------------------

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const position = InputNormalizer.normalize(e.clientX, e.clientY, rect);

      const event: MouseDownEvent = {
        type: 'mouse:down',
        position,
        button: getButton(e),
        modifiers: extractModifiers(e),
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  // ---- Mouse Up --------------------------------------------------------------

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const position = InputNormalizer.normalize(e.clientX, e.clientY, rect);

      const event: MouseUpEvent = {
        type: 'mouse:up',
        position,
        button: getButton(e),
        modifiers: extractModifiers(e),
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  // ---- Wheel -----------------------------------------------------------------

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLElement>) => {
      if (!enabled) return;
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const position = InputNormalizer.normalize(e.clientX, e.clientY, rect);

      const event: MouseWheelEvent = {
        type: 'mouse:wheel',
        position,
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  // ---- Double Click ----------------------------------------------------------

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const position = InputNormalizer.normalize(e.clientX, e.clientY, rect);

      const event: DoubleClickEvent = {
        type: 'mouse:dblclick',
        position,
        button: getButton(e),
        modifiers: extractModifiers(e),
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  // ---- Key Down --------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!enabled) return;
      // Do not block browser shortcuts by default
      // (F5, F12, Ctrl+T etc. require OS-level hooks on the host)

      const event: KeyDownEvent = {
        type: 'key:down',
        key: e.key,
        code: e.code,
        modifiers: extractModifiers(e),
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  // ---- Key Up ----------------------------------------------------------------

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!enabled) return;

      const event: KeyUpEvent = {
        type: 'key:up',
        key: e.key,
        code: e.code,
        modifiers: extractModifiers(e),
        timestamp: Date.now(),
      };
      onEvent(event);
    },
    [enabled, onEvent]
  );

  return {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    handleKeyDown,
    handleKeyUp,
  };
}
