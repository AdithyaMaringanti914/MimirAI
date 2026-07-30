/**
 * @file remote.ts
 * @description Remote session configuration types used across UI components
 * and hooks to manage the viewer canvas, monitor selection, and session metadata.
 */

import type { StreamQuality, SessionMode, ConnectionState } from './webrtc';

// ---------------------------------------------------------------------------
// Canvas Viewport
// ---------------------------------------------------------------------------

/**
 * Dimensions of the rendered remote video canvas in CSS pixels.
 * Used by InputNormalizer to compute accurate normalized coordinates.
 */
export interface CanvasViewport {
  width: number;
  height: number;
  /** Left offset of the video element relative to the viewport */
  offsetX: number;
  /** Top offset of the video element relative to the viewport */
  offsetY: number;
}

// ---------------------------------------------------------------------------
// Monitor / Display Selection
// ---------------------------------------------------------------------------

export type MonitorSelection = 'mon1' | 'mon2' | 'dual';

// ---------------------------------------------------------------------------
// Session Configuration
// ---------------------------------------------------------------------------

/**
 * Serializable configuration for a remote desktop session.
 * Stored and restored when switching tabs or reconnecting.
 */
export interface RemoteSessionConfig {
  mode: SessionMode;
  quality: StreamQuality;
  monitorSelection: MonitorSelection;
  /** Whether the session is in fullscreen mode */
  isFullscreen: boolean;
  /** Whether to capture cursor in the screen share stream */
  captureCursor: boolean;
  /** Whether to capture system audio */
  captureAudio: boolean;
}

export const DEFAULT_SESSION_CONFIG: RemoteSessionConfig = {
  mode: 'host',
  quality: 'hd',
  monitorSelection: 'mon1',
  isFullscreen: false,
  captureCursor: true,
  captureAudio: false,
};

// ---------------------------------------------------------------------------
// Connection Panel State
// ---------------------------------------------------------------------------

/**
 * All state needed to render the ConnectionPanel component.
 */
export interface ConnectionPanelState {
  connectionState: ConnectionState;
  localPeerId: string | null;
  targetPeerId: string;
  sessionMode: SessionMode;
  isConnecting: boolean;
}

// ---------------------------------------------------------------------------
// Session Toolbar State
// ---------------------------------------------------------------------------

/**
 * All state needed to render the SessionToolbar component.
 */
export interface SessionToolbarState {
  connectionState: ConnectionState;
  latencyMs: number;
  fps: number;
  quality: StreamQuality;
  isRecording: boolean;
  isFullscreen: boolean;
  isPaused: boolean;
}
