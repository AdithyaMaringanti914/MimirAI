import React, { useState } from 'react';
import type { Device, ActiveSession, WorkflowTemplate } from '../types';
import {
  Monitor,
  Video,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  Plus,
  Play,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  MonitorSmartphone,
  FolderSync
} from 'lucide-react';
import { useHostIdentity } from '../context/HostIdentityContext';
import { useConnectionManager } from '../hooks/useConnectionManager';

interface DashboardViewProps {
  devices: Device[];
  sessions: ActiveSession[];
  pendingApprovalsCount: number;
  workflows: WorkflowTemplate[];
  onStartSession: (device: Device) => void;
  onQuickConnect: (rustDeskId: string) => void;
  onRunWorkflow: (workflow: WorkflowTemplate) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  devices,
  sessions,
  pendingApprovalsCount,
  workflows,
  onStartSession,
  onRunWorkflow,
  onNavigateTab
}) => {
  const [connectInput, setConnectInput] = useState('');
  const [connectPassword, setConnectPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);

  const { deviceId, password, hostStatus, deviceName, refreshPassword } = useHostIdentity();
  const { manager, session } = useConnectionManager();

  const onlineDevicesCount = devices.filter(d => d.status === 'online').length;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (connectInput.trim()) {
      manager.requestConnection(connectInput.trim(), connectPassword, deviceName);
      // Let the ConnectionManager state handle the rest of the flow
    }
  };

  const handleCopy = async (text: string, type: 'id' | 'pw') => {
    await navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#1A73E8] bg-[#E8F0FE] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Enterprise Control Plane
            </span>
            <span className="text-xs text-[#5F6368]">July 30, 2026</span>
          </div>
          <h1 className="text-xl font-bold text-[#202124] mt-1 tracking-tight">
            Mimir Autonomous Remote Execution System
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Monitor, control, and execute zero-trust automated workflows across enterprise nodes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigateTab('automation')}
            className="bg-white hover:bg-[#F3F4F6] text-[#202124] border border-[#E5E7EB] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#1A73E8]" />
            <span>New Autonomous Task</span>
          </button>

          <button
            onClick={() => onNavigateTab('devices')}
            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Explore Fleet</span>
          </button>
        </div>
      </div>

      {/* Primary 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('devices')}
          className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#1A73E8]/50 hover:shadow-google-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6368]">Devices Online</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#34A853] flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">{onlineDevicesCount}</span>
            <span className="text-xs text-[#5F6368]">/ {devices.length}</span>
          </div>
          <div className="text-[11px] text-[#34A853] font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
            <span>98.8% Fleet Health</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('sessions')}
          className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#1A73E8]/50 hover:shadow-google-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6368]">Running Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">{sessions.length}</span>
            <span className="text-xs text-[#1A73E8]">Active</span>
          </div>
          <div className="text-[11px] text-[#1A73E8] font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] animate-pulse" />
            <span>60 FPS Live Streams</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('approvals')}
          className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#EA4335]/50 hover:shadow-google-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6368]">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-[#FCE8E6] text-[#EA4335] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">{pendingApprovalsCount}</span>
            <span className="text-xs text-[#EA4335] font-semibold">Action Required</span>
          </div>
          <div className="text-[11px] text-[#EA4335] font-medium">
            High-risk command gates
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#FBBC05]/50 hover:shadow-google-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6368]">Tasks Completed</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF7E0] text-[#FBBC05] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">12,840</span>
            <span className="text-xs text-[#34A853] font-medium">+142 today</span>
          </div>
          <div className="text-[11px] text-[#5F6368]">
            Zero safety violations
          </div>
        </div>

        {/* Metric 5 */}
        <div
          onClick={() => onNavigateTab('ai-memory')}
          className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#1A73E8]/50 hover:shadow-google-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5F6368]">AI Success Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">99.4%</span>
            <span className="text-xs text-[#1A73E8]">Accuracy</span>
          </div>
          <div className="text-[11px] text-[#1A73E8] font-medium">
            Autonomous agent v4.0
          </div>
        </div>
      </div>

      {/* Second Section: Identity & Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Your Device + Connect */}
        <div className="flex flex-col space-y-6">
          
          {/* YOUR DEVICE Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center space-x-2">
                <MonitorSmartphone className="w-4 h-4 text-[#1A73E8]" />
                <h2 className="text-sm font-bold text-[#202124]">Your Device</h2>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${hostStatus === 'ready' ? 'bg-[#34A853]' : hostStatus === 'connecting' ? 'bg-[#1A73E8] animate-pulse' : 'bg-[#9AA0A6]'}`} />
                <span className={`text-[11px] font-semibold capitalize ${hostStatus === 'ready' ? 'text-[#34A853]' : hostStatus === 'connecting' ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}>
                  {hostStatus}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* ID Field */}
              <div>
                <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block mb-1">
                  Device ID
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 font-mono text-xl font-bold tracking-[0.1em] text-[#202124] bg-[#F8F9FA] rounded-xl px-4 py-2 border border-[#E5E7EB] select-all">
                    {deviceId || '--- --- ---'}
                  </div>
                  <button
                    onClick={() => handleCopy(deviceId, 'id')}
                    className="p-3 text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#E8F0FE] rounded-xl border border-[#E5E7EB] transition-colors flex-shrink-0"
                    title="Copy Device ID"
                  >
                    {copiedId ? <CheckCircle2 className="w-5 h-5 text-[#34A853]" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 font-mono text-lg font-bold tracking-[0.2em] text-[#202124] bg-[#F8F9FA] rounded-xl px-4 py-2 border border-[#E5E7EB] select-all relative overflow-hidden">
                    {showPassword ? password || '------' : '••••••'}
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-3 text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={refreshPassword}
                      className="p-3 text-[#5F6368] hover:text-[#202124] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors"
                      title="Refresh Password"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCopy(password, 'pw')}
                      className="p-3 text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#E8F0FE] rounded-xl border border-[#E5E7EB] transition-colors"
                      title="Copy Password"
                    >
                      {copiedPw ? <CheckCircle2 className="w-5 h-5 text-[#34A853]" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONNECT TO REMOTE DEVICE Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#1A73E8]" />
                <h2 className="text-sm font-bold text-[#202124]">Connect to Remote Device</h2>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block mb-1">
                  Remote ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 982-410-381"
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  className="w-full bg-[#F8F9FA] text-sm text-[#202124] px-3 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={connectPassword}
                  onChange={(e) => setConnectPassword(e.target.value)}
                  className="w-full bg-[#F8F9FA] text-sm text-[#202124] px-3 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={!connectInput.trim() || !!(session && session.status !== 'idle' && session.status !== 'failed' && session.status !== 'disconnected')}
                  className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {session?.status === 'waiting_approval' ? 'Waiting...' : 
                     session?.status === 'negotiating' ? 'Connecting...' : 
                     'Connect'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  disabled={!connectInput.trim()}
                  className="bg-[#F8F9FA] hover:bg-[#F3F4F6] text-[#5F6368] hover:text-[#1A73E8] border border-[#E5E7EB] font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="File Transfer"
                >
                  <FolderSync className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Recent Devices */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#1A73E8]" />
              <h2 className="text-sm font-bold text-[#202124]">Recent &amp; Favorite Devices</h2>
            </div>
            <button
              onClick={() => onNavigateTab('devices')}
              className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center space-x-1"
            >
              <span>View All ({devices.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                onClick={() => onStartSession(dev)}
                className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#1A73E8]/40 hover:bg-white transition-all cursor-pointer space-y-2 group shadow-google-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <Monitor className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span className="font-bold text-xs text-[#202124] truncate group-hover:text-[#1A73E8]">
                      {dev.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dev.status === 'online' ? 'bg-[#E6F4EA] text-[#34A853]' : 'bg-[#F3F4F6] text-[#5F6368]'
                  }`}>
                    {dev.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#5F6368] font-mono flex items-center justify-between">
                  <span>ID: {dev.rustDeskId}</span>
                  <span>{dev.ipAddress}</span>
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-[#5F6368] pt-1 border-t border-[#E5E7EB]">
                  <span>CPU: {dev.cpuUsage}%</span>
                  <span>RAM: {dev.ramUsage}%</span>
                  <span className="text-[#1A73E8] font-semibold group-hover:underline">Connect &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Workflows Section */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#1A73E8]" />
            <h2 className="text-sm font-bold text-[#202124]">Pinned Autonomous Workflows</h2>
          </div>
          <button
            onClick={() => onNavigateTab('automation')}
            className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center space-x-1"
          >
            <span>Workflow Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#1A73E8]/40 hover:bg-white transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E8F0FE] text-[#1A73E8]">
                    {wf.category}
                  </span>
                  <span className="text-[10px] text-[#5F6368]">{wf.stepsCount} Steps</span>
                </div>
                <h3 className="text-xs font-bold text-[#202124]">{wf.title}</h3>
                <p className="text-[11px] text-[#5F6368] mt-1 leading-relaxed">{wf.description}</p>
              </div>

              <button
                onClick={() => onRunWorkflow(wf)}
                className="w-full mt-2 bg-white hover:bg-[#E8F0FE] text-[#1A73E8] border border-[#1A73E8]/30 font-semibold text-xs py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-[#1A73E8]" />
                <span>Run Autonomous Workflow</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
