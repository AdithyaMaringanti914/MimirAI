/**
 * @file PeerService.ts
 * @description PeerJS implementation of ISignalingProvider.
 *
 * This service wraps the PeerJS library and bridges it to the application's
 * abstract signaling interface. All PeerJS-specific API usage is contained
 * here — no other file should import from 'peerjs' directly.
 *
 * To replace PeerJS with a custom signaling server:
 *   - Implement ISignalingProvider in a new file
 *   - Pass it as `signalingProvider` to useWebRTC
 */

import Peer from 'peerjs';
import type { MediaConnection, DataConnection } from 'peerjs';
import type { ISignalingProvider, SignalingCallbacks } from '../signaling/SignalingInterface';
import type { PeerConfig, WebRTCError } from '../../types/webrtc';
import type { RemoteDataEvent } from '../../types/events';

export class PeerService implements ISignalingProvider {
  private peer: Peer | null = null;
  private localPeerId: string | null = null;

  // ---------------------------------------------------------------------------
  // ISignalingProvider: initialize
  // ---------------------------------------------------------------------------

  async initialize(config: PeerConfig, callbacks: SignalingCallbacks): Promise<string> {
    return new Promise((resolve, reject) => {
      const peerOptions: ConstructorParameters<typeof Peer>[1] = {
        debug: config.debug ?? 0,
      };

      // Apply optional custom signaling server config
      if (config.host) {
        peerOptions.host = config.host;
        peerOptions.port = config.port ?? 443;
        peerOptions.path = config.path ?? '/';
        peerOptions.secure = config.secure ?? true;
      }

      if (config.iceServers) {
        peerOptions.config = { iceServers: config.iceServers };
      }

      this.peer = config.peerId
        ? new Peer(config.peerId, peerOptions)
        : new Peer(peerOptions);

      // -----------------------------------------------------------------------
      // Peer lifecycle events
      // -----------------------------------------------------------------------

      this.peer.on('open', (id: string) => {
        this.localPeerId = id;
        callbacks.onOpen(id);
        resolve(id);
      });

      this.peer.on('error', (err) => {
        const webrtcError = this.classifyPeerError(err);
        callbacks.onError(webrtcError);
        // Reject the promise only during initialization; ongoing errors go to callback
        reject(webrtcError);
      });

      this.peer.on('disconnected', () => {
        callbacks.onDisconnected();
      });

      this.peer.on('close', () => {
        callbacks.onClose();
      });

      // -----------------------------------------------------------------------
      // Incoming connection events
      // -----------------------------------------------------------------------

      this.peer.on('call', (call: MediaConnection) => {
        callbacks.onCall(call);
      });

      this.peer.on('connection', (connection: DataConnection) => {
        callbacks.onConnection(connection);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: callPeer
  // ---------------------------------------------------------------------------

  callPeer(targetPeerId: string, stream: MediaStream): MediaConnection {
    if (!this.peer) {
      throw new Error('PeerService: Cannot call — Peer not initialized.');
    }
    return this.peer.call(targetPeerId, stream);
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: connectDataChannel
  // ---------------------------------------------------------------------------

  connectDataChannel(targetPeerId: string): DataConnection {
    if (!this.peer) {
      throw new Error('PeerService: Cannot open data channel — Peer not initialized.');
    }
    return this.peer.connect(targetPeerId, {
      reliable: true,
      serialization: 'json',
    });
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: sendData
  // ---------------------------------------------------------------------------

  sendData(connection: unknown, data: RemoteDataEvent): void {
    const dataConn = connection as DataConnection;
    if (dataConn.open) {
      dataConn.send(data);
    }
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: destroy
  // ---------------------------------------------------------------------------

  destroy(): void {
    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
    }
    this.peer = null;
    this.localPeerId = null;
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: isReady
  // ---------------------------------------------------------------------------

  isReady(): boolean {
    return this.peer !== null && !this.peer.disconnected && !this.peer.destroyed;
  }

  // ---------------------------------------------------------------------------
  // ISignalingProvider: getLocalPeerId
  // ---------------------------------------------------------------------------

  getLocalPeerId(): string | null {
    return this.localPeerId;
  }

  // ---------------------------------------------------------------------------
  // Private: Error Classification
  // ---------------------------------------------------------------------------

  private classifyPeerError(err: { type?: string; message?: string }): WebRTCError {
    const typeMap: Record<string, WebRTCError['type']> = {
      'peer-unavailable': 'PeerUnavailable',
      'network': 'ICEFailure',
      'disconnected': 'Disconnected',
      'server-error': 'SignalingError',
      'socket-error': 'SignalingError',
      'unavailable-id': 'SignalingError',
    };

    const type = err.type ? (typeMap[err.type] ?? 'Unknown') : 'Unknown';

    return {
      type,
      message: err.message ?? `PeerJS error: ${err.type ?? 'Unknown'}`,
      originalError: err,
    };
  }
}
