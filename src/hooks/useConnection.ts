/**
 * @file useConnection.ts
 * @description Connection manager hook that orchestrates the complete session
 * flow: mode selection, peer initialization, screen capture, and call setup.
 *
 * This hook is the primary interface consumed by RemoteSessionView. It
 * composes useWebRTC + useScreenShare into a single, clean API that the
 * UI layer does not need to micromanage.
 */

import { useCallback, useState } from 'react';
import { useWebRTC } from './useWebRTC';
import { useScreenShare } from './useScreenShare';
import type { ConnectionState, StreamQuality, WebRTCError } from '../types/webrtc';
import type { SessionMode } from '../types/webrtc';
import type { RemoteDataEvent } from '../types/events';
import type { UseWebRTCReturn } from './useWebRTC';

// ---------------------------------------------------------------------------
// Hook Options
// ---------------------------------------------------------------------------

export interface UseConnectionOptions {
  onError?: (error: WebRTCError) => void;
  onStateChange?: (state: ConnectionState) => void;
  onDataReceived?: (event: RemoteDataEvent) => void;
}

// ---------------------------------------------------------------------------
// Hook Return Value
// ---------------------------------------------------------------------------

export interface UseConnectionReturn {
  // State
  connectionState: ConnectionState;
  sessionMode: SessionMode;
  localPeerId: string | null;
  targetPeerId: string;
  isInitialized: boolean;
  isCapturing: boolean;
  stats: UseWebRTCReturn['stats'];
  remoteVideoRef: UseWebRTCReturn['remoteVideoRef'];

  // Actions
  setSessionMode: (mode: SessionMode) => void;
  setTargetPeerId: (id: string) => void;

  /**
   * Host Flow:
   *   1. initialize() — opens signaling peer
   *   2. startSharing() — captures screen and waits for viewer to call in
   *
   * Viewer Flow:
   *   1. initialize() — opens signaling peer
   *   2. connect(targetPeerId) — calls the host
   */
  initialize: () => Promise<void>;
  startSharing: (quality?: StreamQuality) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
  sendDataEvent: (event: RemoteDataEvent) => void;
}

// ---------------------------------------------------------------------------
// useConnection Hook
// ---------------------------------------------------------------------------

export function useConnection(options: UseConnectionOptions = {}): UseConnectionReturn {
  const { onError, onStateChange, onDataReceived } = options;

  const [sessionMode, setSessionMode] = useState<SessionMode>('host');
  const [targetPeerId, setTargetPeerId] = useState('');

  const webRTC = useWebRTC({
    onError,
    onStateChange,
    onDataReceived,
  });

  const screenShare = useScreenShare({
    onStreamEnded: () => {
      // User clicked browser's "Stop sharing" button
      webRTC.disconnect();
    },
    onError,
  });

  // ---- Initialize -----------------------------------------------------------

  const initialize = useCallback(async () => {
    await webRTC.initialize();
  }, [webRTC]);

  // ---- Host: Start sharing screen -------------------------------------------

  const startSharing = useCallback(
    async (quality: StreamQuality = 'hd') => {
      const stream = await screenShare.startCapture(quality, false);
      if (!stream) return; // Error already handled by useScreenShare

      // On the host side, the stream is stored in localStreamRef inside useWebRTC
      // The host waits for an incoming call from the viewer, which triggers answerCall
      // We store the stream so useWebRTC can access it when the viewer calls
      // This is handled via the useWebRTC internal answerCall which reads localStreamRef
      // For host mode, we need to set the stream in useWebRTC's local stream ref
      // We do this by connecting to ourselves is NOT the pattern;
      // instead, the host advertises its Peer ID and the viewer calls the host.
      // Host side just needs to have the stream ready for when answerCall is triggered.
      // We achieve this by calling connectToHost with null target (host-mode bootstrap):
      webRTC.connectToHost('__host_mode__', stream);
    },
    [screenShare, webRTC]
  );

  // ---- Viewer: Connect to host -----------------------------------------------

  const connect = useCallback(() => {
    if (!targetPeerId.trim()) return;

    // Viewer sends an empty MediaStream (we only want to receive, not share)
    const emptyStream = new MediaStream();
    webRTC.connectToHost(targetPeerId.trim(), emptyStream);
  }, [targetPeerId, webRTC]);

  // ---- Disconnect -----------------------------------------------------------

  const disconnect = useCallback(() => {
    screenShare.stopCapture();
    webRTC.disconnect();
  }, [screenShare, webRTC]);

  return {
    connectionState: webRTC.connectionState,
    sessionMode,
    localPeerId: webRTC.localPeerId,
    targetPeerId,
    isInitialized: webRTC.isInitialized,
    isCapturing: screenShare.isCapturing,
    stats: webRTC.stats,
    remoteVideoRef: webRTC.remoteVideoRef,

    setSessionMode,
    setTargetPeerId,
    initialize,
    startSharing,
    connect,
    disconnect,
    sendDataEvent: webRTC.sendDataEvent,
  };
}
