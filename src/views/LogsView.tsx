import React from 'react';
import { Download } from 'lucide-react';

export const LogsView: React.FC = () => {
  const auditLogs = [
    { time: '14:40:02 UTC', severity: 'INFO', actor: 'alex.chen@mimir.corp', action: 'Established remote session SESS-884920 on FIN-NODE-WIN11-PROD', ip: '10.240.12.84' },
    { time: '14:40:15 UTC', severity: 'AI_AGENT', actor: 'Mimir Security Agent 4.0', action: 'Approved Spooler service memory remediation plan', ip: '10.240.12.84' },
    { time: '14:22:09 UTC', severity: 'WARN', actor: 'system.daemon', action: 'Spooler service memory consumption surpassed 1.2 GB threshold', ip: '10.240.12.84' },
    { time: '13:50:00 UTC', severity: 'SECURITY', actor: 'sarah.jenkins@mimir.corp', action: 'Installed Chrome Enterprise package on MACBOOK-PRO-M3-EXEC', ip: '10.240.40.12' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Immutable Compliance Audit Logs</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Cryptographically signed activity trail for SOC2, HIPAA, and PCI-DSS compliance audits.
          </p>
        </div>

        <button className="bg-white hover:bg-[#F3F4F6] text-[#202124] border border-[#E5E7EB] px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors">
          <Download className="w-4 h-4 text-[#1A73E8]" />
          <span>Export Audit Log (CSV/SIEM)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-google-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">Actor / Agent</th>
              <th className="p-3.5">Action Executed</th>
              <th className="p-3.5">Target IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {auditLogs.map((l, i) => (
              <tr key={i} className="hover:bg-[#F8F9FA] transition-colors font-mono">
                <td className="p-3.5 text-[#5F6368]">{l.time}</td>
                <td className="p-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    l.severity === 'SECURITY'
                      ? 'bg-[#FCE8E6] text-[#EA4335]'
                      : l.severity === 'AI_AGENT'
                      ? 'bg-[#E8F0FE] text-[#1A73E8]'
                      : 'bg-[#E6F4EA] text-[#34A853]'
                  }`}>
                    {l.severity}
                  </span>
                </td>
                <td className="p-3.5 text-[#202124] font-bold">{l.actor}</td>
                <td className="p-3.5 text-[#202124] font-sans text-xs">{l.action}</td>
                <td className="p-3.5 text-[#5F6368]">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
