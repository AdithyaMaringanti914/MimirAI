/**
 * @file MediaStreamService.ts
 * @description Encapsulates navigator.mediaDevices.getDisplayMedia() with
 * quality-mapped constraints, stream lifecycle management, and error classification.
 *
 * Quality Presets:
 *   smooth   — 1280x720  @ 30fps  (low bandwidth, smooth experience)
 *   hd       — 1920x1080 @ 60fps  (default high-definition)
 *   lossless — max resolution     (unconstrained, maximum fidelity)
 */

import type { StreamQuality, WebRTCError } from '../../types/webrtc';

// ---------------------------------------------------------------------------
// Quality Constraint Maps
// ---------------------------------------------------------------------------



/**
 * Extended display media constraints including the cursor capture hint.
 * `cursor` is a valid DisplayMediaStreamOptions hint but not typed in
 * TypeScript's lib.dom.d.ts yet — we cast to unknown to stay strict.
 */
type DisplayMediaOptions = DisplayMediaStreamOptions & {
  video?: MediaTrackConstraints & { cursor?: 'always' | 'motion' | 'never' };
};

const QUALITY_CONSTRAINTS: Record<StreamQuality, DisplayMediaOptions> = {
  smooth: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
      cursor: 'always',
    } as MediaTrackConstraints,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  },
  hd: {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 60 },
      cursor: 'always',
    } as MediaTrackConstraints,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  },
  lossless: {
    video: {
      width: { ideal: 3840 },
      height: { ideal: 2160 },
      frameRate: { ideal: 60 },
      cursor: 'always',
    } as MediaTrackConstraints,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  },
};

// ---------------------------------------------------------------------------
// MediaStreamService
// ---------------------------------------------------------------------------

export class MediaStreamService {
  private activeStream: MediaStream | null = null;

  /**
   * Requests a display capture stream at the specified quality.
   * Supports screen, window, and browser tab capture.
   *
   * @param quality - One of 'smooth', 'hd', 'lossless'
   * @param captureAudio - Whether to request system audio
   * @returns The captured MediaStream
   * @throws WebRTCError if the user denies permission or cancels
   */
  async captureDisplay(
    quality: StreamQuality = 'hd',
    captureAudio = false
  ): Promise<MediaStream> {
    const constraints = QUALITY_CONSTRAINTS[quality];

    const displayMediaOptions: DisplayMediaStreamOptions = {
      video: constraints.video,
      audio: captureAudio ? constraints.audio : false,
    };

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
      throw this.classifyMediaError(err);
    }

    this.activeStream = stream;
    return stream;
  }

  /**
   * Returns true if there is currently an active capture stream with
   * at least one live track.
   */
  isCapturing(): boolean {
    return (
      this.activeStream !== null &&
      this.activeStream.getTracks().some((t) => t.readyState === 'live')
    );
  }

  /**
   * Returns the active MediaStream if one exists, otherwise null.
   */
  getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  /**
   * Stops all tracks in the active stream and releases the capture.
   * Safe to call multiple times.
   */
  stopCapture(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
  }

  /**
   * Attaches a handler to detect when the user stops sharing via the
   * browser's native "Stop sharing" button in the capture indicator.
   */
  onStreamEnded(handler: () => void): void {
    if (!this.activeStream) return;
    this.activeStream.getTracks().forEach((track) => {
      track.addEventListener('ended', handler, { once: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Private: Error Classification
  // ---------------------------------------------------------------------------

  private classifyMediaError(err: unknown): WebRTCError {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        // User denied permission OR closed the picker dialog
        const isCancelled =
          err.message.toLowerCase().includes('cancel') ||
          err.message.toLowerCase().includes('permission denied');

        return {
          type: isCancelled ? 'ScreenSharingCancelled' : 'PermissionDenied',
          message: isCancelled
            ? 'Screen sharing was cancelled.'
            : 'Permission to share screen was denied.',
          originalError: err,
        };
      }

      if (err.name === 'NotFoundError') {
        return {
          type: 'MediaFailure',
          message: 'No display available for screen capture.',
          originalError: err,
        };
      }

      if (err.name === 'NotSupportedError') {
        return {
          type: 'MediaFailure',
          message: 'Screen capture is not supported in this browser.',
          originalError: err,
        };
      }
    }

    return {
      type: 'MediaFailure',
      message: 'Failed to start screen capture.',
      originalError: err,
    };
  }
}

/** Singleton instance — one per application lifecycle */
export const mediaStreamService = new MediaStreamService();
