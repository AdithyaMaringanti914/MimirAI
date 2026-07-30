import React from 'react';
import { Brain, Plus } from 'lucide-react';

export const AiMemoryView: React.FC = () => {
  const memories = [
    {
      title: 'Windows Print Spooler Safety Exception',
      type: 'Guardrail Rule',
      details: 'Spooler purge commands must strictly validate C:\\Windows\\System32\\spool\\PRINTERS directory scope.',
      lastUpdated: 'Today, 14:20'
    },
    {
      title: 'PostgreSQL Production Cluster Credentials',
      type: 'Encrypted Vault Context',
      details: 'Stored TLS certificate authority and peer public key fingerprint for db-cluster-01.',
      lastUpdated: 'Yesterday'
    },
    {
      title: 'Retail Edge Outlets Network Subnet Mask',
      type: 'Discovered Network Topology',
      details: '192.168.4.0/24 subnet mapped via automated P2P ping sweep.',
      lastUpdated: '3 days ago'
    }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">AI Memory &amp; Vector Context Store</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Learned environment rules, safety guardrails, node topology, and secure script snippets.
          </p>
        </div>

        <button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Inject Guardrail Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {memories.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#1A73E8] bg-[#E8F0FE] px-2.5 py-0.5 rounded">
                {m.type}
              </span>
              <Brain className="w-4 h-4 text-[#1A73E8]" />
            </div>
            <h3 className="text-xs font-bold text-[#202124]">{m.title}</h3>
            <p className="text-[11px] text-[#5F6368] leading-relaxed">{m.details}</p>
            <div className="text-[10px] text-[#80868B] pt-2 border-t border-[#E5E7EB]">
              Updated: {m.lastUpdated}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
