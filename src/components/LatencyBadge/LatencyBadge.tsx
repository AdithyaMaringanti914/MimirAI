/**
 * @file LatencyBadge.tsx
 * @description Professional connection quality badge displaying latency and
 * connection health with color-coded indicators matching the Mimir design system.
 *
 * Color thresholds (matching Google Material conventions):
 *   ≤ 50ms   — Green  (#34A853) — Excellent
 *   ≤ 150ms  — Yellow (#FBBC05) — Good
 *   > 150ms  — Red    (#EA4335) — Poor
 */

import React, { useMemo } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionState } from '../../types/webrtc';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LatencyBadgeProps {
  latencyMs: number;
  fps: number;
  connectionState: ConnectionState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type QualityLevel = 'excellent' | 'good' | 'poor' | 'offline';

function getQualityLevel(latencyMs: number, connectionState: ConnectionState): QualityLevel {
  if (connectionState === 'Disconnected' || connectionState === 'Connection Lost') {
    return 'offline';
  }
  if (latencyMs === 0) return 'excellent'; // Not yet measured
  if (latencyMs <= 50) return 'excellent';
  if (latencyMs <= 150) return 'good';
  return 'poor';
}

const QUALITY_CONFIG: Record<QualityLevel, {
  textColor: string;
  label: string;
}> = {
  excellent: { textColor: 'text-[#34A853]', label: 'Excellent' },
  good: { textColor: 'text-[#FBBC05]', label: 'Good' },
  poor: { textColor: 'text-[#EA4335]', label: 'Poor' },
  offline: { textColor: 'text-[#9AA0A6]', label: 'Offline' },
};

// ---------------------------------------------------------------------------
// LatencyBadge Component
// ---------------------------------------------------------------------------

export const LatencyBadge: React.FC<LatencyBadgeProps> = ({
  latencyMs,
  fps,
  connectionState,
}) => {
  const quality = useMemo(
    () => getQualityLevel(latencyMs, connectionState),
    [latencyMs, connectionState]
  );

  const config = QUALITY_CONFIG[quality];

  const isConnecting =
    connectionState === 'Initializing' ||
    connectionState === 'Connecting' ||
    connectionState === 'Reconnecting';

  const isConnected =
    connectionState === 'Connected' || connectionState === 'Sharing Screen';

  return (
    <div className="flex items-center space-x-2 border-r border-[#E5E7EB] pr-3 text-xs">
      {/* Latency */}
      <div className={`flex items-center space-x-1 font-semibold ${config.textColor}`}>
        {isConnecting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : quality === 'offline' ? (
          <WifiOff className="w-3.5 h-3.5" />
        ) : (
          <Wifi className="w-3.5 h-3.5" />
        )}
        <span>
          {isConnecting
            ? '— ms'
            : isConnected && latencyMs > 0
            ? `${latencyMs} ms`
            : '— ms'}
        </span>
      </div>

      {/* FPS Badge */}
      <div className="px-1.5 py-0.5 rounded bg-[#E8F0FE] text-[#1A73E8] font-bold text-[10px]">
        {isConnected && fps > 0 ? `${fps} FPS` : '— FPS'}
      </div>
    </div>
  );
};
