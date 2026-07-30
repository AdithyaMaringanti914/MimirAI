/**
 * @file SessionToolbar.tsx
 * @description Professional floating session toolbar for the Mimir remote
 * desktop module. Displays connection status, performance metrics, and
 * session action controls.
 *
 * Integrates with the existing RemoteSessionView toolbar design.
 * Replaces static mock data with live WebRTC state.
 */

import React from 'react';
import {
  Pause,
  Play,
  Square,
  Maximize2,
  Minimize2,
  Camera,
  CircleDot,
  Clipboard,
  FolderSync,
  Sparkles,
} from 'lucide-react';
import { LatencyBadge } from '../LatencyBadge/LatencyBadge';
import type { ConnectionState, StreamQuality } from '../../types/webrtc';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionToolbarProps {
  // Connection
  connectionState: ConnectionState;
  latencyMs: number;
  fps: number;

  // Display & Quality
  selectedMonitor: 'mon1' | 'mon2' | 'dual';
  qualityMode: StreamQuality;
  onMonitorChange: (monitor: 'mon1' | 'mon2' | 'dual') => void;
  onQualityChange: (quality: StreamQuality) => void;

  // Session Controls
  isPaused: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  recordSeconds: number;

  // Actions
  onPauseToggle: () => void;
  onFullscreenToggle: () => void;
  onRecordToggle: () => void;
  onClipboardSync: () => void;
  onScreenshot: () => void;
  onOpenFileTransfer: () => void;
  onOpenAiPanel: () => void;
  onEndSession: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRecordTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// SessionToolbar Component
// ---------------------------------------------------------------------------

export const SessionToolbar: React.FC<SessionToolbarProps> = ({
  connectionState,
  latencyMs,
  fps,
  selectedMonitor,
  qualityMode,
  onMonitorChange,
  onQualityChange,
  isPaused,
  isRecording,
  isFullscreen,
  recordSeconds,
  onPauseToggle,
  onFullscreenToggle,
  onRecordToggle,
  onClipboardSync,
  onScreenshot,
  onOpenFileTransfer,
  onOpenAiPanel,
  onEndSession,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 border border-[#E5E7EB] rounded-2xl shadow-lg px-4 py-2 flex items-center space-x-3 z-30 transition-all">

      {/* Live Latency & FPS Badge */}
      <LatencyBadge
        latencyMs={latencyMs}
        fps={fps}
        connectionState={connectionState}
      />

      {/* Display Selector */}
      <div className="flex items-center space-x-1 border-r border-[#E5E7EB] pr-3">
        {(['mon1', 'mon2', 'dual'] as const).map((mon) => (
          <button
            key={mon}
            onClick={() => onMonitorChange(mon)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedMonitor === mon
                ? 'bg-[#1A73E8] text-white'
                : 'text-[#5F6368] hover:bg-[#F3F4F6]'
            }`}
          >
            {mon === 'mon1' ? 'Display 1' : mon === 'mon2' ? 'Display 2' : 'Dual Screen'}
          </button>
        ))}
      </div>

      {/* Quality Selector */}
      <div className="flex items-center space-x-1 border-r border-[#E5E7EB] pr-3 text-xs">
        {(['smooth', 'hd', 'lossless'] as const).map((q) => (
          <button
            key={q}
            onClick={() => onQualityChange(q)}
            className={`px-2 py-1 rounded-lg font-medium transition-colors capitalize ${
              qualityMode === q
                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold'
                : 'text-[#5F6368] hover:bg-[#F3F4F6]'
            }`}
          >
            {q === 'hd' ? 'HD' : q.charAt(0).toUpperCase() + q.slice(1)}
          </button>
        ))}
      </div>

      {/* Action Tools */}
      <div className="flex items-center space-x-1 border-r border-[#E5E7EB] pr-3">
        <button
          onClick={onOpenFileTransfer}
          className="p-1.5 text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title="File Transfer"
        >
          <FolderSync className="w-4 h-4" />
        </button>

        <button
          onClick={onClipboardSync}
          className="p-1.5 text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title="Sync Clipboard"
        >
          <Clipboard className="w-4 h-4" />
        </button>

        <button
          onClick={onScreenshot}
          className="p-1.5 text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title="Take Screenshot (Coming Soon)"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onRecordToggle}
          className={`p-1.5 rounded-lg flex items-center space-x-1 transition-colors ${
            isRecording ? 'bg-[#FCE8E6] text-[#EA4335]' : 'text-[#5F6368] hover:bg-[#F3F4F6]'
          }`}
          title="Session Recording (Coming Soon)"
        >
          <CircleDot className="w-4 h-4 fill-[#EA4335]" />
          {isRecording && (
            <span className="text-[11px] font-mono font-semibold">
              {formatRecordTime(recordSeconds)}
            </span>
          )}
        </button>
      </div>

      {/* AI Assistant Button */}
      <button
        onClick={onOpenAiPanel}
        className="bg-[#E8F0FE] hover:bg-[#1A73E8] text-[#1A73E8] hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        <span>AI Assistant</span>
      </button>

      {/* Session Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onPauseToggle}
          className="p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title={isPaused ? 'Resume Session' : 'Pause Session'}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-[#34A853]" />
          ) : (
            <Pause className="w-4 h-4 text-[#FBBC05]" />
          )}
        </button>

        <button
          onClick={onFullscreenToggle}
          className="p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title="Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onEndSession}
          className="bg-[#EA4335] hover:bg-[#D93025] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
        >
          <Square className="w-3.5 h-3.5 fill-white" />
          <span>End Session</span>
        </button>
      </div>
    </div>
  );
};
