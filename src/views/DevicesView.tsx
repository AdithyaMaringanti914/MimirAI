import React, { useState } from 'react';
import type { Device, OperatingSystem, TrustLevel } from '../types';
import {
  Monitor,
  Search,
  Grid,
  List,
  Zap,
  FolderSync,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface DevicesViewProps {
  devices: Device[];
  onStartSession: (device: Device) => void;
  onRunAiAction: (device: Device) => void;
  onOpenFileTransfer: (device: Device) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  onStartSession,
  onRunAiAction,
  onOpenFileTransfer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [osFilter, setOsFilter] = useState<string>('all');

  const filteredDevices = devices.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.rustDeskId.includes(searchQuery) ||
      dev.ipAddress.includes(searchQuery) ||
      dev.hostname.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dev.status === statusFilter;
    const matchesOs = osFilter === 'all' || dev.os === osFilter;

    return matchesSearch && matchesStatus && matchesOs;
  });

  const getOsBadge = (os: OperatingSystem) => {
    switch (os) {
      case 'windows':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1A73E8]">Windows</span>;
      case 'macos':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F4F6] text-[#202124]">macOS</span>;
      case 'ubuntu':
      case 'linux':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7E0] text-[#FBBC05]">Linux</span>;
      case 'android':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#34A853]">Android</span>;
    }
  };

  const getTrustBadge = (trust: TrustLevel) => {
    if (trust === 'verified') {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold text-[#34A853] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3 text-[#34A853]" />
          <span>Verified</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-[#FBBC05] bg-[#FEF7E0] px-2 py-0.5 rounded-full">
        {trust}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Devices Fleet</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Real-time telemetry and remote control across {devices.length} enterprise endpoints.
          </p>
        </div>

        <button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Device / Agent</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by device name, RustDesk ID, IP, or hostname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] text-xs text-[#202124] pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white"
            />
            <Search className="w-4 h-4 text-[#80868B] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F8F9FA] text-xs font-medium text-[#202124] px-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={osFilter}
            onChange={(e) => setOsFilter(e.target.value)}
            className="bg-[#F8F9FA] text-xs font-medium text-[#202124] px-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none"
          >
            <option value="all">All Operating Systems</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="ubuntu">Ubuntu / Linux</option>
            <option value="android">Android</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border border-[#E5E7EB] p-1 rounded-xl bg-[#F8F9FA]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white text-[#1A73E8] shadow-google-sm font-bold' : 'text-[#5F6368]'
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white text-[#1A73E8] shadow-google-sm font-bold' : 'text-[#5F6368]'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.map((dev) => (
            <div
              key={dev.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm hover:border-[#1A73E8]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center font-bold">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#202124] tracking-tight">{dev.name}</h3>
                      <div className="text-[11px] text-[#5F6368] font-mono">{dev.hostname}</div>
                    </div>
                  </div>
                  {getTrustBadge(dev.trustLevel)}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E7EB]">
                  {getOsBadge(dev.os)}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dev.status === 'online' ? 'bg-[#E6F4EA] text-[#34A853]' : 'bg-[#F3F4F6] text-[#5F6368]'
                  }`}>
                    {dev.status}
                  </span>
                </div>

                {/* Telemetry Meters */}
                <div className="space-y-1.5 pt-2 text-[11px] text-[#5F6368]">
                  <div className="flex justify-between">
                    <span>CPU Utilization</span>
                    <span className="font-bold text-[#202124]">{dev.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1A73E8] h-full" style={{ width: `${dev.cpuUsage}%` }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Memory Usage</span>
                    <span className="font-bold text-[#202124]">{dev.ramUsage}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FBBC05] h-full" style={{ width: `${dev.ramUsage}%` }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#5F6368] font-mono flex items-center justify-between border-t border-[#E5E7EB]">
                  <span>ID: {dev.rustDeskId}</span>
                  <span>Latency: {dev.latencyMs}ms</span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() => onStartSession(dev)}
                  className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>

                <button
                  onClick={() => onRunAiAction(dev)}
                  className="bg-[#E8F0FE] hover:bg-[#1A73E8] text-[#1A73E8] hover:text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Plan</span>
                </button>

                <button
                  onClick={() => onOpenFileTransfer(dev)}
                  className="bg-[#F8F9FA] hover:bg-[#F3F4F6] text-[#202124] border border-[#E5E7EB] font-medium text-xs py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors"
                >
                  <FolderSync className="w-3.5 h-3.5 text-[#5F6368]" />
                  <span>Files</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-google-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Device Name</th>
                <th className="p-3.5">RustDesk ID</th>
                <th className="p-3.5">OS / Version</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">CPU / RAM</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="p-3.5 font-bold text-[#202124] flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-[#1A73E8]" />
                    <span>{dev.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-[#5F6368]">{dev.rustDeskId}</td>
                  <td className="p-3.5">{getOsBadge(dev.os)}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dev.status === 'online' ? 'bg-[#E6F4EA] text-[#34A853]' : 'bg-[#F3F4F6] text-[#5F6368]'
                    }`}>
                      {dev.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[#5F6368]">{dev.ipAddress}</td>
                  <td className="p-3.5 font-semibold text-[#202124]">
                    {dev.cpuUsage}% CPU / {dev.ramUsage}% RAM
                  </td>
                  <td className="p-3.5 text-[#34A853] font-medium">{dev.latencyMs} ms</td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onStartSession(dev)}
                      className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center space-x-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
