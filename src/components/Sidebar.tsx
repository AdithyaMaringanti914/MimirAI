import React from 'react';
import type { NavigationTab } from '../types';
import {
  LayoutDashboard,
  Monitor,
  Video,
  BookUser,
  Workflow,
  CheckSquare,
  ShieldAlert,
  BarChart3,
  FolderSync,
  Brain,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingApprovalsCount: number;
  activeSessionsCount: number;
  runningTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  pendingApprovalsCount,
  activeSessionsCount,
  runningTasksCount
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'sessions', label: 'Sessions', icon: Video, badge: activeSessionsCount, badgeColor: 'bg-[#1A73E8] text-white' },
    { id: 'address-book', label: 'Address Book', icon: BookUser },
    { id: 'automation', label: 'Automation', icon: Workflow },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: runningTasksCount, badgeColor: 'bg-[#FBBC05] text-[#202124]' },
    { id: 'approvals', label: 'Approvals', icon: ShieldAlert, badge: pendingApprovalsCount, badgeColor: 'bg-[#EA4335] text-white' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: FolderSync },
    { id: 'ai-memory', label: 'AI Memory', icon: Brain },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-all duration-200 shrink-0 z-20 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Menu Items */}
      <div className="py-3 px-2 flex-1 overflow-y-auto space-y-1">
        {!collapsed && (
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#80868B]">
            Navigation
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const hasBadge = typeof item.badge === 'number' && item.badge > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold'
                  : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && hasBadge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-[#F3F4F6] text-[#202124]'}`}>
                  {item.badge}
                </span>
              )}

              {collapsed && hasBadge && (
                <div className="w-2 h-2 rounded-full bg-[#1A73E8]" />
              )}
            </button>
          );
        })}
      </div>

      {/* AI Assistant Quick Status Footer */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#202124] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Mimir AI Engine</span>
          </div>
          <p className="text-[11px] text-[#5F6368] mb-2 leading-relaxed">
            Autonomous agent active on 2 background tasks with 99.4% precision.
          </p>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1A73E8] h-full w-[99.4%]" />
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#E5E7EB] flex items-center justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 flex items-center justify-center text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
