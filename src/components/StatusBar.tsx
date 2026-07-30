import React from 'react';
import { ShieldCheck, Wifi, Sparkles, Activity, Layers } from 'lucide-react';
import { useHostIdentity } from '../context/HostIdentityContext';

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
  const { hostStatus } = useHostIdentity();

  const getStatusConfig = () => {
    switch (hostStatus) {
      case 'ready':
        return { color: 'text-[#34A853]', bg: 'bg-[#34A853]', text: 'Ready' };
      case 'connecting':
        return { color: 'text-[#1A73E8]', bg: 'bg-[#1A73E8]', text: 'Connecting' };
      case 'waiting':
        return { color: 'text-[#FBBC05]', bg: 'bg-[#FBBC05]', text: 'Waiting Approval' };
      case 'disconnected':
        return { color: 'text-[#EA4335]', bg: 'bg-[#EA4335]', text: 'Disconnected' };
      case 'offline':
      default:
        return { color: 'text-[#5F6368]', bg: 'bg-[#9AA0A6]', text: 'Offline' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <footer className="h-7 bg-[#F8F9FA] border-t border-[#E5E7EB] px-3 flex items-center justify-between text-[11px] font-medium text-[#5F6368] shrink-0 select-none z-30">
      {/* Left items */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-1.5 ${statusConfig.color}`}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.bg} ${hostStatus === 'ready' || hostStatus === 'connecting' ? 'animate-pulse' : ''}`}></span>
          <span className="font-semibold">{statusConfig.text}</span>
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
