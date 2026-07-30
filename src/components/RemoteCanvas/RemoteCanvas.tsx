/**
 * @file RemoteCanvas.tsx
 * @description The primary remote screen video container component.
 *
 * Responsibilities:
 *   - Binds the HTMLVideoElement ref from useWebRTC
 *   - Maintains 16:9 aspect ratio within available space
 *   - Captures mouse and keyboard input for useRemoteInput
 *   - Displays a simulated remote cursor overlay
 *   - Shows loading/connecting placeholder when no stream is active
 *   - Handles fullscreen toggling on the container element
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Monitor, Loader2, WifiOff } from 'lucide-react';
import { InputService } from '../../services/InputService';
import { connectionManager } from '../../services/connection/ConnectionManager';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RemoteCanvasProps {
  /** Ref from useWebRTC to bind to the <video> element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Current connection state for rendering placeholder states */
  connectionState: string;
  /** Whether to capture and transmit mouse/keyboard input */
  inputEnabled?: boolean;
  /** Removed onInputEvent in favor of direct InputService dispatching */
  /** Whether the canvas is in fullscreen mode */
  isFullscreen?: boolean;
}

// ---------------------------------------------------------------------------
// RemoteCanvas Component
// ---------------------------------------------------------------------------

export const RemoteCanvas: React.FC<RemoteCanvasProps> = ({
  videoRef,
  connectionState,
  inputEnabled = true,
  isFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);

  const isConnected =
    connectionState === 'Connected' || connectionState === 'Sharing Screen';

  const isConnecting =
    connectionState === 'Initializing' ||
    connectionState === 'Connecting' ||
    connectionState === 'Reconnecting';

  // ---- Remote Input Service -------------------------------------------------

  useEffect(() => {
    if (!containerRef.current || !inputEnabled || !isConnected) return;

    const inputService = new InputService(containerRef.current, connectionManager.remoteInput);
    inputService.attach();

    return () => {
      inputService.detach();
    };
  }, [inputEnabled, isConnected]);

  // ---- Cursor Tracking for visual overlay -----------------------------------

  const handleMouseMoveWithCursor = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    []
  );

  // ---- Fullscreen API -------------------------------------------------------

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isFullscreen && document.fullscreenElement !== el) {
      el.requestFullscreen().catch(() => {
        // Fullscreen may be blocked
      });
    } else if (!isFullscreen && document.fullscreenElement === el) {
      document.exitFullscreen().catch(() => {});
    }
  }, [isFullscreen]);

  // ---- Video autoplay on stream assign -------------------------------------

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      video.play().catch(() => {
        // Autoplay policy: play will be triggered by user interaction
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoRef]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {/* Remote Video Stream */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          isConnected && inputEnabled ? 'cursor-crosshair' : ''
        }`}
        tabIndex={isConnected ? 0 : -1}
        onMouseMove={handleMouseMoveWithCursor}
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
        style={{ outline: 'none' }}
      >
        {/* The actual video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className={`max-w-full max-h-full object-contain rounded-xl transition-opacity duration-300 ${
            isConnected ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            // Prevent video element from capturing events
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        />

        {/* Remote Cursor Overlay (visual feedback for host) */}
        {showCursor && isConnected && inputEnabled && (
          <div
            className="absolute pointer-events-none transition-transform duration-[30ms]"
            style={{
              transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
              top: 0,
              left: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M4 2L16 9.5L9.5 11L7 17L4 2Z"
                fill="#1A73E8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Loading / Connecting Placeholder */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            {isConnecting ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[#1A73E8] animate-spin" />
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">
                    {connectionState}
                  </div>
                  <div className="text-[#64748B] text-xs mt-1">
                    Establishing secure P2P connection...
                  </div>
                </div>
              </>
            ) : connectionState === 'Connection Lost' ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] flex items-center justify-center">
                  <WifiOff className="w-7 h-7 text-[#EA4335]" />
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">Connection Lost</div>
                  <div className="text-[#64748B] text-xs mt-1">
                    Attempting to reconnect...
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] flex items-center justify-center">
                  <Monitor className="w-7 h-7 text-[#475569]" />
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">No Active Stream</div>
                  <div className="text-[#64748B] text-xs mt-1">
                    Configure the connection panel to begin.
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
