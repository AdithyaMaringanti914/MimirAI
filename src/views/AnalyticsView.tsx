import React from 'react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Infrastructure Telemetry &amp; Analytics</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Fleet bandwidth consumption, AI automation yield, and P2P peer latency stats.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-2">
          <div className="text-xs text-[#5F6368] font-medium">Total Bandwidth (30d)</div>
          <div className="text-2xl font-bold text-[#1A73E8]">4.82 TB</div>
          <div className="text-[11px] text-[#34A853] font-medium">&uarr; 12% vs last month</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-2">
          <div className="text-xs text-[#5F6368] font-medium">Total Remote Sessions</div>
          <div className="text-2xl font-bold text-[#202124]">1,480</div>
          <div className="text-[11px] text-[#5F6368]">Avg duration: 28m</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-2">
          <div className="text-xs text-[#5F6368] font-medium">AI Automation Yield</div>
          <div className="text-2xl font-bold text-[#34A853]">84.2%</div>
          <div className="text-[11px] text-[#34A853] font-medium">1,240 hrs saved</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-2">
          <div className="text-xs text-[#5F6368] font-medium">Average Peer Latency</div>
          <div className="text-2xl font-bold text-[#1A73E8]">14.2 ms</div>
          <div className="text-[11px] text-[#34A853] font-medium">Direct P2P Link</div>
        </div>
      </div>

      {/* Analytics Charts Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-sm font-bold text-[#202124]">Bandwidth Usage Peak Timeline (Mbps)</h3>
            <span className="text-xs text-[#1A73E8] font-semibold">Real-Time</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
            {[45, 62, 88, 30, 95, 78, 120, 110, 85, 140, 98, 115].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-[#1A73E8] hover:bg-[#1557B0] rounded-t-md transition-all"
                  style={{ height: `${val}px` }}
                />
                <span className="text-[9px] text-[#80868B]">{idx + 1}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-sm font-bold text-[#202124]">OS Distribution Breakdown</h3>
            <span className="text-xs text-[#5F6368]">1,500 Nodes</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Windows 11 / Server</span>
                <span className="text-[#1A73E8]">64% (960 devices)</span>
              </div>
              <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1A73E8] h-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Ubuntu &amp; Linux Server</span>
                <span className="text-[#FBBC05]">22% (330 devices)</span>
              </div>
              <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#FBBC05] h-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>macOS Enterprise</span>
                <span className="text-[#34A853]">10% (150 devices)</span>
              </div>
              <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#34A853] h-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
