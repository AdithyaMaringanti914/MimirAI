/**
 * @file useWebRTC.ts
 * @description Master WebRTC hook for the Mimir remote desktop module.
 *
 * Responsibilities:
 *   - Initialize PeerJS via PeerService (lazy — not on mount)
 *   - Generate and expose the local Peer ID
 *   - Manage the full ConnectionState machine
 *   - Handle incoming media calls (host → viewer stream)
 *   - Handle outgoing media calls (viewer → connects to host)
 *   - Create and manage RTCDataChannel for input events
 *   - Measure real-time latency via ping/pong
 *   - Reconnect automatically on connection loss
 *   - Expose remoteVideoRef for <video> element binding
 *   - Clean up all resources on unmount or disconnect
 *
 * Architecture: All PeerJS access is delegated to PeerService.
 * Swapping the signaling backend requires only changing the service instance.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaConnection, DataConnection } from 'peerjs';

import { PeerService } from '../services/peer/PeerService';
import { DEFAULT_RECONNECT_POLICY } from '../types/webrtc';
import type {
  ConnectionState,
  PeerConfig,
  WebRTCStats,
  WebRTCError,
  ReconnectPolicy,
} from '../types/webrtc';
import type { RemoteDataEvent, PingEvent, PongEvent } from '../types/events';

// ---------------------------------------------------------------------------
// Hook Options
// ---------------------------------------------------------------------------

export interface UseWebRTCOptions {
  /** PeerJS / signaling configuration. Defaults to PeerJS Cloud. */
  peerConfig?: PeerConfig;
  /** Reconnect policy on connection loss. */
  reconnectPolicy?: ReconnectPolicy;
  /** Callback fired when connection state changes. */
  onStateChange?: (state: ConnectionState) => void;
  /** Callback fired on any error. Used to show toasts in the UI. */
  onError?: (error: WebRTCError) => void;
  /** Callback fired when a DataChannel message is received. */
  onDataReceived?: (event: RemoteDataEvent) => void;
}

// ---------------------------------------------------------------------------
// Hook Return Value
// ---------------------------------------------------------------------------

export interface UseWebRTCReturn {
  /** Current connection lifecycle state */
  connectionState: ConnectionState;
  /** The local peer ID assigned by the signaling server */
  localPeerId: string | null;
  /** Ref to bind to the <video> element on the viewer side */
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Ref to bind to the <video> element on the host side (loopback preview) */
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Live WebRTC performance statistics */
  stats: WebRTCStats;
  /** Whether the peer service has been initialized */
  isInitialized: boolean;

  /** Initialize PeerJS and generate a local Peer ID */
  initialize: () => Promise<void>;
  /** Connect to a remote peer (viewer side: calls host to receive stream) */
  connectToHost: (targetPeerId: string, localStream: MediaStream) => void;
  /** Accept incoming connection from viewer (host side) */
  answerCall: (call: MediaConnection) => void;
  /** Send a data event over the RTCDataChannel */
  sendDataEvent: (event: RemoteDataEvent) => void;
  /** Gracefully disconnect from the current session */
  disconnect: () => void;
  /** Destroy the entire peer instance and reset all state */
  destroy: () => void;
}

// ---------------------------------------------------------------------------
// Default Stats
// ---------------------------------------------------------------------------

const DEFAULT_STATS: WebRTCStats = {
  latencyMs: 0,
  fps: 0,
  resolution: { width: 0, height: 0 },
  bytesReceived: 0,
  packetLossPercent: 0,
  capturedAt: 0,
};

// ---------------------------------------------------------------------------
// useWebRTC Hook
// ---------------------------------------------------------------------------

export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
  const {
    peerConfig = {},
    reconnectPolicy = DEFAULT_RECONNECT_POLICY,
    onStateChange,
    onError,
    onDataReceived,
  } = options;

  // ---- State ----------------------------------------------------------------
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
  const [localPeerId, setLocalPeerId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState<WebRTCStats>(DEFAULT_STATS);

  // ---- Refs -----------------------------------------------------------------
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerServiceRef = useRef<PeerService | null>(null);
  const activeCallRef = useRef<MediaConnection | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPingsRef = useRef<Map<string, number>>(new Map());
  const targetPeerIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ---- State Transition Helper -----------------------------------------------

  const transition = useCallback(
    (newState: ConnectionState) => {
      setConnectionState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // ---- Error Helper ----------------------------------------------------------

  const handleError = useCallback(
    (error: WebRTCError) => {
      onError?.(error);
    },
    [onError]
  );

  // ---- Cleanup Helpers -------------------------------------------------------

  const stopStatsCollection = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  const stopPingLoop = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    pendingPingsRef.current.clear();
  }, []);

  const cleanupCall = useCallback(() => {
    stopStatsCollection();
    stopPingLoop();

    if (activeCallRef.current) {
      activeCallRef.current.close();
      activeCallRef.current = null;
    }

    if (dataConnectionRef.current) {
      dataConnectionRef.current.close();
      dataConnectionRef.current = null;
    }

    // Clear video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [stopStatsCollection, stopPingLoop]);

  // ---- Stats Collection via RTCPeerConnection --------------------------------

  const startStatsCollection = useCallback((call: MediaConnection) => {
    stopStatsCollection();

    statsIntervalRef.current = setInterval(async () => {
      const pc = (call as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
      if (!pc) return;

      try {
        const report = await pc.getStats();
        let fps = 0;
        let bytesReceived = 0;
        let width = 0;
        let height = 0;

        report.forEach((stat) => {
          if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
            fps = stat.framesPerSecond ?? fps;
            bytesReceived = stat.bytesReceived ?? bytesReceived;
            width = stat.frameWidth ?? width;
            height = stat.frameHeight ?? height;
          }
        });

        setStats((prev) => ({
          ...prev,
          fps: Math.round(fps),
          bytesReceived,
          resolution: { width, height },
          capturedAt: Date.now(),
        }));
      } catch {
        // Stats collection failure is non-fatal
      }
    }, 2000);
  }, [stopStatsCollection]);

  // ---- Ping / Pong for Latency -----------------------------------------------

  const startPingLoop = useCallback(() => {
    stopPingLoop();

    pingIntervalRef.current = setInterval(() => {
      if (!dataConnectionRef.current?.open) return;

      const pingId = `ping-${Date.now()}`;
      const ping: PingEvent = { type: 'ping', id: pingId, timestamp: Date.now() };

      pendingPingsRef.current.set(pingId, Date.now());
      dataConnectionRef.current.send(ping);
    }, 3000);
  }, [stopPingLoop]);

  const handlePong = useCallback((pong: PongEvent) => {
    const sentAt = pendingPingsRef.current.get(pong.id);
    if (sentAt !== undefined) {
      const rtt = Date.now() - sentAt;
      pendingPingsRef.current.delete(pong.id);
      setStats((prev) => ({ ...prev, latencyMs: rtt, capturedAt: Date.now() }));
    }
  }, []);

  // ---- Data Channel Setup ---------------------------------------------------

  const setupDataConnection = useCallback(
    (conn: DataConnection) => {
      dataConnectionRef.current = conn;

      conn.on('data', (rawData: unknown) => {
        const event = rawData as RemoteDataEvent;

        // Handle ping/pong internally for latency measurement
        if (event.type === 'ping') {
          const pong: PongEvent = {
            type: 'pong',
            id: (event as PingEvent).id,
            originalTimestamp: (event as PingEvent).timestamp,
            timestamp: Date.now(),
          };
          conn.send(pong);
          return;
        }

        if (event.type === 'pong') {
          handlePong(event as PongEvent);
          return;
        }

        onDataReceived?.(event);
      });

      conn.on('close', () => {
        dataConnectionRef.current = null;
      });

      conn.on('error', (err) => {
        handleError({ type: 'ICEFailure', message: 'Data channel error.', originalError: err });
      });
    },
    [handlePong, onDataReceived, handleError]
  );

  // ---- Incoming Call Handler (Host side) ------------------------------------

  const answerCall = useCallback(
    (call: MediaConnection) => {
      if (!localStreamRef.current) {
        handleError({
          type: 'MediaFailure',
          message: 'No local screen stream available to share.',
        });
        return;
      }

      activeCallRef.current = call;
      call.answer(localStreamRef.current);
      transition('Sharing Screen');

      call.on('stream', () => {
        // Host side: no remote stream needed, but log it
      });

      call.on('close', () => {
        cleanupCall();
        transition('Disconnected');
      });

      call.on('error', (err) => {
        handleError({ type: 'ICEFailure', message: 'Call error on host.', originalError: err });
        cleanupCall();
        transition('Connection Lost');
      });
    },
    [cleanupCall, handleError, transition]
  );

  // ---- Outgoing Call (Viewer side — calls host to receive stream) -----------

  const connectToHost = useCallback(
    (targetPeerId: string, localStream: MediaStream) => {
      if (!peerServiceRef.current?.isReady()) {
        handleError({ type: 'SignalingError', message: 'Peer not ready. Please initialize first.' });
        return;
      }

      targetPeerIdRef.current = targetPeerId;
      localStreamRef.current = localStream;
      transition('Connecting');

      try {
        // Open data channel first
        const dataConn = peerServiceRef.current.connectDataChannel(targetPeerId) as DataConnection;
        setupDataConnection(dataConn);

        // Then initiate the media call
        const call = peerServiceRef.current.callPeer(targetPeerId, localStream) as MediaConnection;
        activeCallRef.current = call;

        call.on('stream', (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {
              // Autoplay may be blocked; user interaction will trigger play
            });
          }
          reconnectAttemptsRef.current = 0;
          transition('Connected');
          startStatsCollection(call);
          startPingLoop();
        });

        call.on('close', () => {
          cleanupCall();
          attemptReconnect();
        });

        call.on('error', (err) => {
          handleError({ type: 'ICEFailure', message: 'Call failed.', originalError: err });
          cleanupCall();
          transition('Connection Lost');
        });
      } catch (err) {
        handleError({ type: 'PeerUnavailable', message: 'Could not connect to peer.', originalError: err });
        transition('Connection Lost');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cleanupCall, handleError, setupDataConnection, startPingLoop, startStatsCollection, transition]
  );

  // ---- Reconnect Logic ------------------------------------------------------

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= reconnectPolicy.maxAttempts) {
      transition('Connection Lost');
      handleError({
        type: 'Disconnected',
        message: `Connection lost after ${reconnectPolicy.maxAttempts} reconnect attempts.`,
      });
      return;
    }

    transition('Reconnecting');
    const attempt = reconnectAttemptsRef.current;
    const delay = reconnectPolicy.exponentialBackoff
      ? reconnectPolicy.baseDelayMs * Math.pow(2, attempt)
      : reconnectPolicy.baseDelayMs;

    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (targetPeerIdRef.current && localStreamRef.current) {
        connectToHost(targetPeerIdRef.current, localStreamRef.current);
      }
    }, delay);
  }, [connectToHost, handleError, reconnectPolicy, transition]);

  // ---- Initialize -----------------------------------------------------------

  const initialize = useCallback(async () => {
    if (isInitialized && peerServiceRef.current?.isReady()) return;

    transition('Initializing');

    const service = new PeerService();
    peerServiceRef.current = service;

    try {
      const peerId = await service.initialize(peerConfig, {
        onOpen: (id) => {
          setLocalPeerId(id);
          setIsInitialized(true);
          transition('Ready');
        },
        onError: (error) => {
          handleError(error);
          transition('Disconnected');
        },
        onDisconnected: () => {
          transition('Reconnecting');
          // PeerJS auto-reconnects to signaling server
        },
        onClose: () => {
          setIsInitialized(false);
          transition('Disconnected');
        },
        onCall: (call) => {
          answerCall(call as MediaConnection);
        },
        onConnection: (conn) => {
          setupDataConnection(conn as DataConnection);
        },
      });

      setLocalPeerId(peerId);
    } catch (err) {
      handleError({
        type: 'SignalingError',
        message: 'Failed to initialize peer connection.',
        originalError: err,
      });
      transition('Disconnected');
    }
  }, [answerCall, handleError, isInitialized, peerConfig, setupDataConnection, transition]);

  // ---- Send Data Event -------------------------------------------------------

  const sendDataEvent = useCallback((event: RemoteDataEvent) => {
    if (dataConnectionRef.current?.open) {
      dataConnectionRef.current.send(event);
    }
  }, []);

  // ---- Disconnect -----------------------------------------------------------

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    cleanupCall();
    targetPeerIdRef.current = null;
    localStreamRef.current = null;
    reconnectAttemptsRef.current = 0;
    setStats(DEFAULT_STATS);
    transition('Disconnected');
  }, [cleanupCall, transition]);

  // ---- Destroy --------------------------------------------------------------

  const destroy = useCallback(() => {
    disconnect();
    peerServiceRef.current?.destroy();
    peerServiceRef.current = null;
    setLocalPeerId(null);
    setIsInitialized(false);
  }, [disconnect]);

  // ---- Cleanup on Unmount ---------------------------------------------------

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopStatsCollection();
      stopPingLoop();
      cleanupCall();
      peerServiceRef.current?.destroy();
    };
  }, [cleanupCall, stopPingLoop, stopStatsCollection]);

  // ---------------------------------------------------------------------------

  return {
    connectionState,
    localPeerId,
    remoteVideoRef,
    localVideoRef,
    stats,
    isInitialized,
    initialize,
    connectToHost,
    answerCall,
    sendDataEvent,
    disconnect,
    destroy,
  };
}
