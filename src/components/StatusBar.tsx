import React from 'react';
import { ShieldCheck, Wifi, Sparkles, Activity, Layers } from 'lucide-react';

interface StatusBarProps {
  deviceCount: number;
  activeSessionCount: number;
  aiEngineStatus: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  deviceCount,
  activeSessionCount,
  aiEngineStatus
}) => {
  return (
    <footer className="h-7 bg-[#F8F9FA] border-t border-[#E5E7EB] px-3 flex items-center justify-between text-[11px] font-medium text-[#5F6368] shrink-0 select-none z-30">
      {/* Left items */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-[#34A853]">
          <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
          <span className="font-semibold">Mimir Daemon Online</span>
        </div>

        <div className="flex items-center space-x-1 text-[#5F6368]">
          <Layers className="w-3 h-3 text-[#1A73E8]" />
          <span>{deviceCount} Nodes Discovered</span>
        </div>

        <div className="flex items-center space-x-1 text-[#5F6368]">
          <Activity className="w-3 h-3 text-[#1A73E8]" />
          <span>{activeSessionCount} Active Streams</span>
        </div>
      </div>

      {/* Center item */}
      <div className="hidden md:flex items-center space-x-1.5 bg-white border border-[#E5E7EB] px-2.5 py-0.5 rounded-full text-[#1A73E8]">
        <Sparkles className="w-3 h-3 text-[#1A73E8]" />
        <span className="font-semibold text-[10.5px]">AI Agent: {aiEngineStatus}</span>
      </div>

      {/* Right items */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-[#34A853]" />
          <span>TLS 1.3 | AES-256 GCM</span>
        </div>

        <div className="flex items-center space-x-1 text-[#1A73E8]">
          <Wifi className="w-3 h-3" />
          <span>Latency: 14 ms (Direct P2P)</span>
        </div>

        <div className="text-[#80868B]">v3.4.0-Enterprise</div>
      </div>
    </footer>
  );
};
