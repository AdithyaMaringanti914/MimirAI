import React, { useState, useEffect } from 'react';
import type { NavigationTab } from '../types';
import {
  Search,
  Zap,
  Monitor,
  Video,
  Workflow,
  FileText,
  Settings,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onQuickConnect: (id: string) => void;
  onRunAiAction: (actionName: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onQuickConnect,
  onRunAiAction
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      category: 'AI Autonomous Actions',
      items: [
        { id: 'ai-clean', title: 'AI Action: Clean Temporary & Cache Files', icon: Sparkles, action: () => onRunAiAction('Clean Temporary Files') },
        { id: 'ai-chrome', title: 'AI Action: Install Google Chrome Enterprise', icon: Sparkles, action: () => onRunAiAction('Install Chrome') },
        { id: 'ai-[#1A73E8]', title: 'AI Action: Diagnose Network Latency & Peer Routes', icon: Sparkles, action: () => onRunAiAction('Diagnose Network') },
        { id: 'ai-opt', title: 'AI Action: Optimize Node Memory & CPU Allocation', icon: Sparkles, action: () => onRunAiAction('Optimize Performance') },
        { id: 'ai-rep', title: 'AI Action: Generate Security Compliance Audit Report', icon: Sparkles, action: () => onRunAiAction('Generate Report') }
      ]
    },
    {
      category: 'Navigation',
      items: [
        { id: 'nav-dash', title: 'Go to Dashboard', icon: Monitor, action: () => onSelectTab('dashboard') },
        { id: 'nav-dev', title: 'Go to Devices Fleet', icon: Monitor, action: () => onSelectTab('devices') },
        { id: 'nav-[#1A73E8]', title: 'Go to Active Sessions', icon: Video, action: () => onSelectTab('sessions') },
        { id: 'nav-auto', title: 'Go to Automation & Visual Workflow Builder', icon: Workflow, action: () => onSelectTab('automation') },
        { id: 'nav-files', title: 'Go to Dual Pane File Transfer', icon: FileText, action: () => onSelectTab('files') },
        { id: 'nav-[#1A73E8]', title: 'Go to Google Style Enterprise Settings', icon: Settings, action: () => onSelectTab('settings') }
      ]
    },
    {
      category: 'Quick Connect Presets',
      items: [
        { id: 'conn-fin', title: 'Connect to FIN-NODE-WIN11-PROD (982-410-381)', icon: Zap, action: () => onQuickConnect('982-410-381') },
        { id: 'conn-mac', title: 'Connect to MACBOOK-PRO-M3-EXEC (419-702-115)', icon: Zap, action: () => onQuickConnect('419-702-115') },
        { id: 'conn-db', title: 'Connect to UBUNTU-DB-CLUSTER-01 (633-819-204)', icon: Zap, action: () => onQuickConnect('633-819-204') }
      ]
    }
  ];

  const filteredCommands = commands.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-google-lg w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-3 border-b border-[#E5E7EB] flex items-center space-x-3 bg-white">
          <Search className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <input
            type="text"
            placeholder="Type a command, device ID, or AI intent (e.g. 'Clean temp files')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-xs font-medium text-[#202124] focus:outline-none placeholder-[#80868B]"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 bg-[#F8F9FA]">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6368]">
              No commands found matching "{query}". Try typing "clean", "connect", or "devices".
            </div>
          ) : (
            filteredCommands.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#80868B]">
                  {cat.category}
                </div>
                {cat.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#1A73E8]/40 hover:bg-[#E8F0FE]/50 text-left transition-all text-xs text-[#202124] group shadow-google-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#F8F9FA] group-hover:bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center border border-[#E5E7EB]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium group-hover:text-[#1A73E8]">{item.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#80868B] group-hover:text-[#1A73E8] transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-[#E5E7EB] bg-white text-[11px] text-[#5F6368] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#202124] font-mono text-[10px]">↑↓</span>
            <span>Navigate</span>
            <span className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#202124] font-mono text-[10px]">↵</span>
            <span>Select</span>
            <span className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#202124] font-mono text-[10px]">esc</span>
            <span>Dismiss</span>
          </div>
          <span className="text-[#1A73E8] font-semibold">Mimir Command Engine</span>
        </div>
      </div>
    </div>
  );
};
