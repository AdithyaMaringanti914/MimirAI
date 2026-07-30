/**
 * @file useScreenShare.ts
 * @description Host-side hook for initiating and managing a screen capture session.
 *
 * Responsibilities:
 *   - Request display media via MediaStreamService
 *   - Track capture state and active stream
 *   - Detect user-initiated stop via browser capture indicator
 *   - Release MediaStream tracks on cleanup
 *   - Expose the stream to useWebRTC for broadcasting
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaStreamService } from '../services/media/MediaStreamService';
import type { StreamQuality, WebRTCError } from '../types/webrtc';

// ---------------------------------------------------------------------------
// Hook Options
// ---------------------------------------------------------------------------

export interface UseScreenShareOptions {
  onStreamEnded?: () => void;
  onError?: (error: WebRTCError) => void;
}

// ---------------------------------------------------------------------------
// Hook Return Value
// ---------------------------------------------------------------------------

export interface UseScreenShareReturn {
  /** The active captured MediaStream, or null if not capturing */
  stream: MediaStream | null;
  /** Whether the screen capture is currently active */
  isCapturing: boolean;
  /** Start capturing the display at the given quality */
  startCapture: (quality?: StreamQuality, captureAudio?: boolean) => Promise<MediaStream | null>;
  /** Stop the active capture and release all tracks */
  stopCapture: () => void;
}

// ---------------------------------------------------------------------------
// useScreenShare Hook
// ---------------------------------------------------------------------------

export function useScreenShare(options: UseScreenShareOptions = {}): UseScreenShareReturn {
  const { onStreamEnded, onError } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Stable ref so the cleanup effect doesn't need stream in its deps
  const streamRef = useRef<MediaStream | null>(null);

  // ---- Start Capture --------------------------------------------------------

  const startCapture = useCallback(
    async (
      quality: StreamQuality = 'hd',
      captureAudio = false
    ): Promise<MediaStream | null> => {
      // Stop any existing capture before starting a new one
      if (streamRef.current) {
        mediaStreamService.stopCapture();
      }

      try {
        const captured = await mediaStreamService.captureDisplay(quality, captureAudio);

        // Attach browser "Stop sharing" button handler
        mediaStreamService.onStreamEnded(() => {
          setStream(null);
          setIsCapturing(false);
          streamRef.current = null;
          onStreamEnded?.();
        });

        streamRef.current = captured;
        setStream(captured);
        setIsCapturing(true);
        return captured;
      } catch (err) {
        const error = err as WebRTCError;
        onError?.(error);
        return null;
      }
    },
    [onError, onStreamEnded]
  );

  // ---- Stop Capture ---------------------------------------------------------

  const stopCapture = useCallback(() => {
    mediaStreamService.stopCapture();
    streamRef.current = null;
    setStream(null);
    setIsCapturing(false);
  }, []);

  // ---- Cleanup on Unmount ---------------------------------------------------

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        mediaStreamService.stopCapture();
        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream,
    isCapturing,
    startCapture,
    stopCapture,
  };
}
