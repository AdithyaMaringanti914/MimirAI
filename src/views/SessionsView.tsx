import React, { useState } from 'react';
import type { ActiveSession } from '../types';
import {
  Video,
  Search,
  CircleDot
} from 'lucide-react';

interface SessionsViewProps {
  sessions: ActiveSession[];
  onEndSession: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ sessions, onEndSession }) => {
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter(
    s => s.deviceName.toLowerCase().includes(search.toLowerCase()) || s.operator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Active Remote Desktop Sessions</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Real-time live streams, bandwidth metrics, and recorded audit trails.
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-google-sm flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search sessions by operator or device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8F9FA] text-xs text-[#202124] pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8]"
          />
          <Search className="w-4 h-4 text-[#80868B] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-[#5F6368] font-medium">{filteredSessions.length} active session(s)</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-google-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Session ID</th>
              <th className="p-3.5">Target Device</th>
              <th className="p-3.5">Operator</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5">Stream Quality</th>
              <th className="p-3.5">Recording</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredSessions.map((s) => (
              <tr key={s.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="p-3.5 font-mono font-bold text-[#1A73E8]">{s.sessionId}</td>
                <td className="p-3.5 font-bold text-[#202124] flex items-center space-x-2">
                  <Video className="w-4 h-4 text-[#1A73E8]" />
                  <span>{s.deviceName}</span>
                </td>
                <td className="p-3.5 font-medium text-[#5F6368]">{s.operator}</td>
                <td className="p-3.5 font-mono text-[#202124]">{s.duration}</td>
                <td className="p-3.5 font-medium text-[#34A853]">
                  {s.fps} FPS / {s.bandwidthMbps} Mbps / {s.latencyMs}ms
                </td>
                <td className="p-3.5">
                  <span className="flex items-center space-x-1 text-[11px] text-[#EA4335] font-semibold">
                    <CircleDot className="w-3.5 h-3.5 fill-[#EA4335]" />
                    <span>REC Active</span>
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <button
                    onClick={() => onEndSession(s.id)}
                    className="bg-[#EA4335] hover:bg-[#D93025] text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    End Session
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
