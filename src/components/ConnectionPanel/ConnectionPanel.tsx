/**
 * @file ConnectionPanel.tsx
 * @description Professional connection configuration panel for the Mimir
 * remote desktop module. Displays local Peer ID, target peer input,
 * session mode switcher, connection status, and action buttons.
 *
 * Design: Matches Mimir's Google Material light theme with rounded cards,
 * soft borders, and subtle shadows. No external component library required.
 */

import React, { useCallback } from 'react';
import {
  Monitor,
  MonitorPlay,
  Copy,
  CheckCheck,
  Loader2,
  Wifi,
  WifiOff,
  CircleDot,
} from 'lucide-react';
import { useState } from 'react';
import type { ConnectionState, SessionMode } from '../../types/webrtc';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConnectionPanelProps {
  connectionState: ConnectionState;
  localPeerId: string | null;
  targetPeerId: string;
  sessionMode: SessionMode;
  isInitialized: boolean;

  onTargetPeerIdChange: (id: string) => void;
  onSessionModeChange: (mode: SessionMode) => void;
  onInitialize: () => void;
  onConnect: () => void;
  onStartSharing: () => void;
  onDisconnect: () => void;
}

// ---------------------------------------------------------------------------
// State Badge Config
// ---------------------------------------------------------------------------

type BadgeConfig = {
  label: string;
  dotClass: string;
  textClass: string;
};

const STATE_BADGE: Record<ConnectionState, BadgeConfig> = {
  Disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-[#9AA0A6]',
    textClass: 'text-[#5F6368]',
  },
  Initializing: {
    label: 'Initializing...',
    dotClass: 'bg-[#FBBC05] animate-pulse',
    textClass: 'text-[#FBBC05]',
  },
  Ready: {
    label: 'Ready',
    dotClass: 'bg-[#34A853]',
    textClass: 'text-[#34A853]',
  },
  Connecting: {
    label: 'Connecting...',
    dotClass: 'bg-[#1A73E8] animate-pulse',
    textClass: 'text-[#1A73E8]',
  },
  Connected: {
    label: 'Connected',
    dotClass: 'bg-[#34A853]',
    textClass: 'text-[#34A853]',
  },
  'Sharing Screen': {
    label: 'Sharing Screen',
    dotClass: 'bg-[#34A853] animate-pulse',
    textClass: 'text-[#34A853]',
  },
  'Connection Lost': {
    label: 'Connection Lost',
    dotClass: 'bg-[#EA4335]',
    textClass: 'text-[#EA4335]',
  },
  Reconnecting: {
    label: 'Reconnecting...',
    dotClass: 'bg-[#FBBC05] animate-pulse',
    textClass: 'text-[#FBBC05]',
  },
};

// ---------------------------------------------------------------------------
// ConnectionPanel Component
// ---------------------------------------------------------------------------

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  connectionState,
  localPeerId,
  targetPeerId,
  sessionMode,
  isInitialized,
  onTargetPeerIdChange,
  onSessionModeChange,
  onInitialize,
  onConnect,
  onStartSharing,
  onDisconnect,
}) => {
  const [copied, setCopied] = useState(false);

  const badge = STATE_BADGE[connectionState];

  const isDisconnected =
    connectionState === 'Disconnected' || connectionState === 'Connection Lost';
  const isConnected =
    connectionState === 'Connected' || connectionState === 'Sharing Screen';
  const isBusy =
    connectionState === 'Initializing' ||
    connectionState === 'Connecting' ||
    connectionState === 'Reconnecting';

  // ---- Copy Peer ID ---------------------------------------------------------

  const handleCopyPeerId = useCallback(async () => {
    if (!localPeerId) return;
    await navigator.clipboard.writeText(localPeerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [localPeerId]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
              <MonitorPlay className="w-4 h-4 text-[#1A73E8]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#202124]">Remote Desktop</div>
              <div className="text-[11px] text-[#5F6368]">WebRTC P2P Connection</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
            <span className={`text-xs font-semibold ${badge.textClass}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-5 space-y-4">
          {/* Session Mode Switcher */}
          <div>
            <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wide mb-1.5 block">
              Session Mode
            </label>
            <div className="flex rounded-xl border border-[#E5E7EB] overflow-hidden">
              <button
                onClick={() => onSessionModeChange('host')}
                disabled={isConnected || isBusy}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  sessionMode === 'host'
                    ? 'bg-[#1A73E8] text-white'
                    : 'bg-white text-[#5F6368] hover:bg-[#F8F9FA]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Share My Screen (Host)</span>
              </button>
              <button
                onClick={() => onSessionModeChange('viewer')}
                disabled={isConnected || isBusy}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold transition-colors border-l border-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed ${
                  sessionMode === 'viewer'
                    ? 'bg-[#1A73E8] text-white'
                    : 'bg-white text-[#5F6368] hover:bg-[#F8F9FA]'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>View Remote Screen</span>
              </button>
            </div>
          </div>

          {/* Your Peer ID (Host mode) */}
          {sessionMode === 'host' && (
            <div>
              <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wide mb-1.5 block">
                Your Connection ID
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 font-mono text-sm bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[#202124] select-all">
                  {localPeerId ? (
                    <span>{localPeerId}</span>
                  ) : (
                    <span className="text-[#9AA0A6] italic">
                      {isInitialized ? 'Generating...' : 'Not initialized'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopyPeerId}
                  disabled={!localPeerId}
                  title="Copy Connection ID"
                  className="p-2.5 rounded-xl border border-[#E5E7EB] text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#E8F0FE] hover:border-[#1A73E8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-[#34A853]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#9AA0A6] mt-1.5">
                Share this ID with the viewer to establish a connection.
              </p>
            </div>
          )}

          {/* Target Peer ID (Viewer mode) */}
          {sessionMode === 'viewer' && (
            <div>
              <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wide mb-1.5 block">
                Host Connection ID
              </label>
              <input
                type="text"
                value={targetPeerId}
                onChange={(e) => onTargetPeerIdChange(e.target.value)}
                disabled={isConnected || isBusy}
                placeholder="Enter host peer ID..."
                className="w-full font-mono text-sm bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[#202124] placeholder-[#9AA0A6] focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all disabled:bg-[#F8F9FA] disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-[#9AA0A6] mt-1.5">
                Enter the Connection ID provided by the host.
              </p>
            </div>
          )}

          {/* Viewer: Your ID for reference */}
          {sessionMode === 'viewer' && localPeerId && (
            <div>
              <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wide mb-1.5 block">
                Your ID (for reference)
              </label>
              <div className="font-mono text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#5F6368] select-all">
                {localPeerId}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer: Action Buttons */}
        <div className="px-5 pb-5 space-y-2">
          {!isInitialized && (
            <button
              onClick={onInitialize}
              disabled={isBusy}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              <span>Initialize Connection</span>
            </button>
          )}

          {isInitialized && isDisconnected && sessionMode === 'host' && (
            <button
              onClick={onStartSharing}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2D9248] text-white text-sm font-semibold transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span>Start Screen Share</span>
            </button>
          )}

          {isInitialized && isDisconnected && sessionMode === 'viewer' && (
            <button
              onClick={onConnect}
              disabled={!targetPeerId.trim()}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wifi className="w-4 h-4" />
              <span>Connect to Host</span>
            </button>
          )}

          {isBusy && (
            <div className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#5F6368] text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-[#1A73E8]" />
              <span>{badge.label}</span>
            </div>
          )}

          {isConnected && (
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#FCE8E6] hover:bg-[#EA4335] text-[#EA4335] hover:text-white text-sm font-semibold transition-colors border border-[#EA4335]/30"
            >
              <WifiOff className="w-4 h-4" />
              <span>Disconnect Session</span>
            </button>
          )}
        </div>

        {/* Active Session Indicator */}
        {isConnected && (
          <div className="px-5 pb-4">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#E6F4EA] border border-[#34A853]/30">
              <CircleDot className="w-3.5 h-3.5 text-[#34A853] fill-[#34A853]" />
              <span className="text-xs font-semibold text-[#34A853]">
                {connectionState === 'Sharing Screen'
                  ? 'Screen sharing is live'
                  : 'Remote session active'}
              </span>
              <span className="text-xs text-[#34A853]/70 ml-auto">End-to-end encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
