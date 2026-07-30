import React from 'react';
import {
  ShieldCheck,
  Search,
  Bell,
  ChevronDown,
  Lock,
  Minus,
  Square,
  X,
  Sparkles,
  Server,
  Zap
} from 'lucide-react';

interface TitleBarProps {
  workspace: string;
  setWorkspace: (ws: string) => void;
  onOpenCommandPalette: () => void;
  onQuickConnect: (rustDeskId: string) => void;
  activeSessionCount: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  workspace,
  setWorkspace,
  onOpenCommandPalette,
  onQuickConnect,
  activeSessionCount,
}) => {
  const [quickInput, setQuickInput] = React.useState('');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onQuickConnect(quickInput.trim());
      setQuickInput('');
    }
  };

  return (
    <header className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-3 shrink-0 select-none z-30">
      {/* Left: Window Controls & Branding */}
      <div className="flex items-center space-x-3">
        {/* Custom Window Buttons */}
        <div className="flex items-center space-x-1.5 mr-1">
          <button className="w-3 h-3 rounded-full bg-[#EA4335]/80 hover:bg-[#EA4335] flex items-center justify-center group transition-colors">
            <X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#FBBC05]/80 hover:bg-[#FBBC05] flex items-center justify-center group transition-colors">
            <Minus className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#34A853]/80 hover:bg-[#34A853] flex items-center justify-center group transition-colors">
            <Square className="w-1.5 h-1.5 text-white opacity-0 group-hover:opacity-100" />
          </button>
        </div>

        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-2 border-l border-[#E5E7EB] pl-3">
          <div className="w-7 h-7 rounded-lg bg-[#1A73E8] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-sm tracking-tight text-[#202124]">Mimir</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E8F0FE] text-[#1A73E8]">
              Enterprise AI
            </span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="relative pl-2">
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center space-x-1.5 text-xs font-medium text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] px-2 py-1 rounded-md transition-colors border border-[#E5E7EB]"
          >
            <Server className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>{workspace}</span>
            <ChevronDown className="w-3 h-3 text-[#80868B]" />
          </button>

          {isWorkspaceOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white border border-[#E5E7EB] rounded-lg shadow-google-md py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
                Workspaces
              </div>
              {[
                'Global Infrastructure',
                'Production Fleet',
                'Finance Edge Nodes',
                'R&D Staging Lab'
              ].map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setWorkspace(ws);
                    setIsWorkspaceOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F3F4F6] ${
                    ws === workspace ? 'font-semibold text-[#1A73E8] bg-[#E8F0FE]/50' : 'text-[#202124]'
                  }`}
                >
                  <span>{ws}</span>
                  {ws === workspace && <ShieldCheck className="w-3.5 h-3.5 text-[#1A73E8]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search / Quick Connect Bar */}
      <div className="flex-1 max-w-xl mx-4 flex items-center space-x-2">
        <form onSubmit={handleConnectSubmit} className="flex-1 flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Enter RustDesk ID (e.g., 982-410-381) or Remote Host IP..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-full bg-[#F8F9FA] text-xs text-[#202124] pl-9 pr-24 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[#5F6368] absolute left-3 top-1/2 -translate-y-1/2" />
            
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>Connect</span>
            </button>
          </div>
        </form>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1 bg-[#F8F9FA] hover:bg-[#F3F4F6] text-[#5F6368] hover:text-[#202124] px-2 py-1 rounded-lg border border-[#E5E7EB] text-xs font-medium transition-colors shrink-0"
          title="Search actions and command palette"
        >
          <span className="text-[11px]">⌘K</span>
        </button>
      </div>

      {/* Right: Security Pill & Actions */}
      <div className="flex items-center space-x-3">
        {/* Security Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E6F4EA] border border-[#34A853]/20 text-[#34A853] text-[11px] font-medium">
          <Lock className="w-3 h-3 text-[#34A853]" />
          <span>TLS 1.3 | AES-256</span>
        </div>

        {/* Active Sessions Count */}
        {activeSessionCount > 0 && (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#1A73E8] text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1A73E8] animate-pulse"></span>
            <span>{activeSessionCount} Active Session{activeSessionCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button className="p-1.5 rounded-lg text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EA4335]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#E5E7EB]">
          <div className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xs font-semibold">
            AC
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#202124] leading-tight">Alex Chen</div>
            <div className="text-[10px] text-[#5F6368]">Principal Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
