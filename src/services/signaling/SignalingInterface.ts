/**
 * @file SignalingInterface.ts
 * @description Abstract signaling provider interface that decouples the WebRTC
 * application logic from any specific signaling implementation (PeerJS, custom
 * WebSocket server, gRPC, etc.).
 *
 * To swap PeerJS for a custom signaling server:
 *   1. Implement ISignalingProvider
 *   2. Pass the new implementation to useWebRTC
 *   3. No hook or UI code needs to change
 */

import type { PeerConfig, WebRTCError } from '../../types/webrtc';

// ---------------------------------------------------------------------------
// Signaling Event Callbacks
// ---------------------------------------------------------------------------

export interface SignalingCallbacks {
  onOpen: (peerId: string) => void;
  onError: (error: WebRTCError) => void;
  onDisconnected: () => void;
  onClose: () => void;
  onCall: (call: unknown) => void;
  onConnection: (connection: unknown) => void;
}

// ---------------------------------------------------------------------------
// Signaling Provider Contract
// ---------------------------------------------------------------------------

/**
 * Abstract interface for a WebRTC signaling provider.
 * PeerService implements this against PeerJS. Future implementors
 * may target custom WebSocket signaling servers.
 */
export interface ISignalingProvider {
  /**
   * Initialize the signaling provider and begin listening for events.
   * @param config - Platform-specific configuration
   * @param callbacks - Event handlers for signaling lifecycle events
   */
  initialize(config: PeerConfig, callbacks: SignalingCallbacks): Promise<string>;

  /**
   * Initiate a media call to a remote peer.
   * @param targetPeerId - The peer ID to call
   * @param stream - The local MediaStream to share
   * @returns An opaque call handle (implementation-specific)
   */
  callPeer(targetPeerId: string, stream: MediaStream): unknown;

  /**
   * Open a data channel connection to a remote peer.
   * @param targetPeerId - The peer ID to connect to
   * @returns An opaque connection handle (implementation-specific)
   */
  connectDataChannel(targetPeerId: string): unknown;

  /**
   * Send data over an established data channel connection.
   * @param connection - The opaque connection handle
   * @param data - Serializable data to send
   */
  sendData(connection: unknown, data: unknown): void;

  /**
   * Gracefully close all connections and destroy the peer.
   */
  destroy(): void;

  /**
   * Returns true if the peer is currently open and reachable.
   */
  isReady(): boolean;

  /**
   * Returns the local peer ID assigned by the signaling server.
   */
  getLocalPeerId(): string | null;
}
