import React from 'react';
import type { FileTransferItem } from '../types';
import {
  HardDrive,
  Monitor,
  Folder,
  FileText,
  ChevronRight
} from 'lucide-react';

interface FileTransferViewProps {
  transfers: FileTransferItem[];
}

export const FileTransferView: React.FC<FileTransferViewProps> = ({ transfers }) => {
  const localFiles = [
    { name: 'mimir_enterprise_agent_v3.4.msi', size: '48.2 MB', type: 'MSI Installer', modified: '2026-07-30' },
    { name: 'security_policy_2026.json', size: '14.2 KB', type: 'JSON File', modified: '2026-07-29' },
    { name: 'ssl_certificate_chain.crt', size: '4.1 KB', type: 'Certificate', modified: '2026-07-28' },
    { name: 'deploy_script_windows.ps1', size: '12.8 KB', type: 'PowerShell Script', modified: '2026-07-25' }
  ];

  const remoteFiles = [
    { name: 'C:\\Windows\\System32\\spool\\PRINTERS', size: '<DIR>', type: 'Directory', modified: '2026-07-30' },
    { name: 'postgres_backup_20260730.dump.gz', size: '1.24 GB', type: 'Archive', modified: '2026-07-30' },
    { name: 'application_event_log.evtx', size: '184.2 MB', type: 'Event Log', modified: '2026-07-30' },
    { name: 'system_telemetry.csv', size: '8.4 MB', type: 'CSV Document', modified: '2026-07-29' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Dual-Pane Remote File Explorer</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Encrypted high-speed bi-directional file transfer with SHA-256 integrity verification.
          </p>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Local Host */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-[#1A73E8]" />
              <h2 className="text-xs font-bold text-[#202124]">Local Machine (Admin Workstation)</h2>
            </div>
            <span className="text-[10.5px] font-mono text-[#5F6368]">C:\Users\Admin\Downloads</span>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-1 text-xs text-[#5F6368] bg-[#F8F9FA] p-2 rounded-xl border border-[#E5E7EB]">
            <span>C:</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span>Users</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span>Admin</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span className="font-bold text-[#202124]">Downloads</span>
          </div>

          {/* File Table */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[10px] font-semibold text-[#80868B] uppercase">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {localFiles.map((f, i) => (
                  <tr key={i} className="hover:bg-[#E8F0FE]/50 transition-colors cursor-pointer">
                    <td className="p-2.5 font-medium text-[#202124] flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span className="truncate max-w-[180px]">{f.name}</span>
                    </td>
                    <td className="p-2.5 text-[#5F6368] font-mono">{f.size}</td>
                    <td className="p-2.5 text-[#5F6368]">{f.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Pane: Remote Host */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-[#34A853]" />
              <h2 className="text-xs font-bold text-[#202124]">Remote Host (FIN-NODE-WIN11-PROD)</h2>
            </div>
            <span className="text-[10.5px] font-mono text-[#5F6368]">C:\System32\Spool</span>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-1 text-xs text-[#5F6368] bg-[#F8F9FA] p-2 rounded-xl border border-[#E5E7EB]">
            <span>C:</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span>Windows</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span>System32</span>
            <ChevronRight className="w-3 h-3 text-[#80868B]" />
            <span className="font-bold text-[#202124]">spool</span>
          </div>

          {/* File Table */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[10px] font-semibold text-[#80868B] uppercase">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {remoteFiles.map((f, i) => (
                  <tr key={i} className="hover:bg-[#E8F0FE]/50 transition-colors cursor-pointer">
                    <td className="p-2.5 font-medium text-[#202124] flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-[#FBBC05]" />
                      <span className="truncate max-w-[180px]">{f.name}</span>
                    </td>
                    <td className="p-2.5 text-[#5F6368] font-mono">{f.size}</td>
                    <td className="p-2.5 text-[#5F6368]">{f.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Queue Section */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
        <h2 className="text-sm font-bold text-[#202124]">Active &amp; Recent Transfer Queue</h2>
        <div className="space-y-2">
          {transfers.map(ft => (
            <div key={ft.id} className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[#202124]">{ft.fileName}</div>
                <div className="text-[11px] text-[#5F6368]">
                  {ft.source} &rarr; {ft.destination} ({ft.size})
                </div>
              </div>

              <div className="w-56 space-y-1">
                <div className="flex justify-between text-[10px] text-[#5F6368]">
                  <span className="capitalize text-[#1A73E8] font-semibold">{ft.status}</span>
                  <span>{ft.progress}% ({ft.speed})</span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A73E8] h-full" style={{ width: `${ft.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
