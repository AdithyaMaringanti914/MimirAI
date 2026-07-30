/**
 * @file webrtc.ts
 * @description Core WebRTC type definitions for the Mimir remote desktop module.
 * These types define the contract for connection lifecycle, stream configuration,
 * and session statistics used across hooks, services, and UI components.
 */

// ---------------------------------------------------------------------------
// Connection State Machine
// ---------------------------------------------------------------------------

/**
 * Represents the full lifecycle of a WebRTC peer connection.
 * Components derive their UI from this state — no ad-hoc booleans needed.
 */
export type ConnectionState =
  | 'Disconnected'
  | 'Initializing'
  | 'Ready'
  | 'Connecting'
  | 'Connected'
  | 'Sharing Screen'
  | 'Connection Lost'
  | 'Reconnecting';

// ---------------------------------------------------------------------------
// Session Mode
// ---------------------------------------------------------------------------

/**
 * Defines whether the local peer is acting as the screen sharer (Host)
 * or the remote controller consuming the stream (Viewer).
 */
export type SessionMode = 'host' | 'viewer';

// ---------------------------------------------------------------------------
// Stream Quality Presets
// ---------------------------------------------------------------------------

/**
 * Named quality tiers for screen capture constraints.
 * Maps to MediaTrackConstraints inside MediaStreamService.
 */
export type StreamQuality = 'smooth' | 'hd' | 'lossless';

// ---------------------------------------------------------------------------
// Peer Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration passed to PeerService when initializing a Peer instance.
 * Abstracting this allows future migration to a custom signaling server
 * without touching any hook or UI code.
 */
export interface PeerConfig {
  /** Optional custom Peer ID; if omitted PeerJS auto-generates one. */
  peerId?: string;
  /** PeerJS Cloud / Custom signaling host */
  host?: string;
  /** Signaling server port */
  port?: number;
  /** Signaling path prefix */
  path?: string;
  /** Whether to use secure (WSS/HTTPS) transport */
  secure?: boolean;
  /** STUN / TURN ICE server configuration */
  iceServers?: RTCIceServer[];
  /** Enable verbose PeerJS debug logging (0 = off, 3 = max) */
  debug?: 0 | 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Session Statistics
// ---------------------------------------------------------------------------

/**
 * Real-time performance statistics captured from RTCStatsReport.
 * Displayed in SessionToolbar / LatencyBadge components.
 */
export interface WebRTCStats {
  /** Round-trip time in milliseconds */
  latencyMs: number;
  /** Decoded video frames per second */
  fps: number;
  /** Video frame resolution */
  resolution: {
    width: number;
    height: number;
  };
  /** Total bytes received on the video track */
  bytesReceived: number;
  /** Packet loss percentage */
  packetLossPercent: number;
  /** Timestamp of the last stats snapshot */
  capturedAt: number;
}

// ---------------------------------------------------------------------------
// Error Classification
// ---------------------------------------------------------------------------

/**
 * Categorized error types for user-facing toast notifications and
 * internal reconnect decision logic.
 */
export type WebRTCErrorType =
  | 'PermissionDenied'
  | 'ScreenSharingCancelled'
  | 'PeerUnavailable'
  | 'Disconnected'
  | 'ICEFailure'
  | 'MediaFailure'
  | 'Timeout'
  | 'SignalingError'
  | 'Unknown';

export interface WebRTCError {
  type: WebRTCErrorType;
  message: string;
  originalError?: unknown;
}

// ---------------------------------------------------------------------------
// Reconnect Policy
// ---------------------------------------------------------------------------

/**
 * Configures automatic reconnect behaviour after connection loss.
 */
export interface ReconnectPolicy {
  /** Maximum number of reconnect attempts before giving up */
  maxAttempts: number;
  /** Base delay in milliseconds between reconnect attempts */
  baseDelayMs: number;
  /** Whether to use exponential backoff between retries */
  exponentialBackoff: boolean;
}

export const DEFAULT_RECONNECT_POLICY: ReconnectPolicy = {
  maxAttempts: 3,
  baseDelayMs: 2000,
  exponentialBackoff: true,
};
