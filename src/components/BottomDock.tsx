import React, { useState } from 'react';
import type { FileTransferItem } from '../types';
import {
  Terminal as TerminalIcon,
  FileText,
  Clipboard,
  ArrowUpDown,
  Activity,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';

interface BottomDockProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  transfers: FileTransferItem[];
}

export const BottomDock: React.FC<BottomDockProps> = ({
  isExpanded,
  setIsExpanded,
  transfers
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'terminal' | 'clipboard' | 'transfers' | 'performance' | 'events'>('logs');
  const [copiedText, setCopiedText] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<string[]>([
    'Mimir CLI v3.4.0 [Target: FIN-NODE-WIN11-PROD (10.240.12.84)]',
    'Type "help" or "ai diagnose" for autonomous remote diagnostics.',
    'mimir-cli> systeminfo | Select-String "OS Name"'
  ]);

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    setCliHistory(prev => [...prev, `mimir-cli> ${cliInput}`, `[OK] Command scheduled on remote daemon.`]);
    setCliInput('');
  };

  const copySampleClipboard = () => {
    navigator.clipboard?.writeText('https://mimir.corp/access/token-884920');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!isExpanded) {
    return (
      <div className="h-8 bg-white border-t border-[#E5E7EB] px-3 flex items-center justify-between text-xs font-medium text-[#5F6368] shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => { setIsExpanded(true); setActiveTab('logs'); }}
            className="flex items-center space-x-1.5 hover:text-[#202124]"
          >
            <FileText className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Logs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#202124]">Live</span>
          </button>

          <button
            onClick={() => { setIsExpanded(true); setActiveTab('terminal'); }}
            className="flex items-center space-x-1.5 hover:text-[#202124]"
          >
            <TerminalIcon className="w-3.5 h-3.5 text-[#34A853]" />
            <span>Terminal CLI</span>
          </button>

          <button
            onClick={() => { setIsExpanded(true); setActiveTab('transfers'); }}
            className="flex items-center space-x-1.5 hover:text-[#202124]"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FBBC05]" />
            <span>Transfers ({transfers.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-1 hover:text-[#202124] text-xs font-semibold"
        >
          <span>Expand Dock</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-56 bg-white border-t border-[#E5E7EB] flex flex-col shrink-0 z-10 shadow-google-lg">
      {/* Dock Bar Header & Tabs */}
      <div className="h-9 bg-[#F8F9FA] border-b border-[#E5E7EB] px-3 flex items-center justify-between text-xs font-medium shrink-0">
        <div className="flex items-center space-x-1">
          {[
            { id: 'logs', label: 'Logs', icon: FileText },
            { id: 'terminal', label: 'Terminal CLI', icon: TerminalIcon },
            { id: 'clipboard', label: 'Clipboard Sync', icon: Clipboard },
            { id: 'transfers', label: `Transfers (${transfers.length})`, icon: ArrowUpDown },
            { id: 'performance', label: 'Performance Gauges', icon: Activity },
            { id: 'events', label: 'Security Events', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#1A73E8] font-semibold border border-[#E5E7EB] shadow-google-sm'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-[#E5E7EB] rounded-md transition-colors"
          title="Minimize dock"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Dock Content Body */}
      <div className="flex-1 overflow-y-auto p-3 text-xs bg-white">
        {activeTab === 'logs' && (
          <div className="font-mono text-[11px] space-y-1 text-[#202124]">
            <div className="text-[#34A853]">[14:40:02.102 INFO] Encrypted connection established to host 10.240.12.84 via TLS 1.3</div>
            <div className="text-[#1A73E8]">[14:40:05.419 AGENT] AI Remediation engine attached. Model: Mimir-Edge-4.0-Fast</div>
            <div className="text-[#5F6368]">[14:40:12.890 AUDIT] Operator alex.chen@mimir.corp granted remote keyboard control</div>
            <div className="text-[#FBBC05]">[14:40:18.002 WARN] Host Spooler service memory consumption exceeding 1.2 GB threshold</div>
            <div className="text-[#202124]">[14:40:22.441 STEP2] Executing: Stop-Service -Name "Spooler" -Force</div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full bg-[#202124] text-white p-3 rounded-lg font-mono text-[11px]">
            <div className="flex-1 overflow-y-auto space-y-1">
              {cliHistory.map((line, idx) => (
                <div key={idx} className={line.startsWith('mimir-cli>') ? 'text-[#34A853]' : 'text-[#E5E7EB]'}>
                  {line}
                </div>
              ))}
            </div>
            <form onSubmit={handleCliSubmit} className="flex items-center space-x-2 pt-2 border-t border-gray-700">
              <span className="text-[#34A853]">mimir-cli&gt;</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Type remote PowerShell / Bash command..."
                className="flex-1 bg-transparent text-white focus:outline-none text-[11px]"
              />
            </form>
          </div>
        )}

        {activeTab === 'clipboard' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#202124]">Shared Bi-directional Clipboard Sync</span>
              <button
                onClick={copySampleClipboard}
                className="flex items-center space-x-1 px-2.5 py-1 bg-[#E8F0FE] text-[#1A73E8] font-semibold text-xs rounded-lg hover:bg-[#1A73E8] hover:text-white transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy Sample String'}</span>
              </button>
            </div>
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg font-mono text-[11px] text-[#202124]">
              https://mimir.corp/access/token-884920?role=admin&amp;expires=3600
            </div>
            <p className="text-[11px] text-[#5F6368]">
              Automated end-to-end encrypted sync between local machine OS clipboard and remote workstation.
            </p>
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="space-y-2">
            {transfers.map((ft) => (
              <div key={ft.id} className="p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg flex items-center justify-between text-xs">
                <div className="space-y-1 max-w-sm">
                  <div className="font-semibold text-[#202124]">{ft.fileName}</div>
                  <div className="text-[11px] text-[#5F6368]">
                    {ft.source} &rarr; {ft.destination} ({ft.size})
                  </div>
                </div>

                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-[10px] text-[#5F6368]">
                    <span>{ft.status}</span>
                    <span>{ft.progress}% ({ft.speed})</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1A73E8] h-full transition-all duration-300"
                      style={{ width: `${ft.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-center">
              <div className="text-[11px] text-[#5F6368]">Remote CPU</div>
              <div className="text-lg font-bold text-[#1A73E8]">18%</div>
              <div className="text-[10px] text-[#34A853]">Normal Range</div>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-center">
              <div className="text-[11px] text-[#5F6368]">Remote RAM</div>
              <div className="text-lg font-bold text-[#FBBC05]">42%</div>
              <div className="text-[10px] text-[#5F6368]">6.7 / 16.0 GB</div>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-center">
              <div className="text-[11px] text-[#5F6368]">Stream Bandwidth</div>
              <div className="text-lg font-bold text-[#34A853]">4.8 Mbps</div>
              <div className="text-[10px] text-[#5F6368]">60 FPS @ 1080p</div>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-center">
              <div className="text-[11px] text-[#5F6368]">Relay RTT Latency</div>
              <div className="text-lg font-bold text-[#1A73E8]">14 ms</div>
              <div className="text-[10px] text-[#34A853]">Direct Peer Link</div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-1 text-xs">
            <div className="p-2 bg-[#E6F4EA] border border-[#34A853]/30 rounded-lg text-[#202124] flex items-center justify-between">
              <span>[SEC-VERIFIED] Mutual TLS certificate validation passed (Cert fingerprint: SHA256:88A9...20FF)</span>
              <span className="text-[10px] text-[#34A853] font-semibold">PASSED</span>
            </div>
            <div className="p-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-[#202124] flex items-center justify-between">
              <span>[RBAC-CHECK] User alex.chen@mimir.corp holds full execution privilege</span>
              <span className="text-[10px] text-[#5F6368]">AUTHORIZED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
