import React from 'react';

export const TasksView: React.FC = () => {
  const tasks = [
    {
      id: 'tsk-001',
      title: 'Scheduled Nightly WinSxS Cache Clean',
      target: 'FIN-NODE-WIN11-PROD',
      schedule: 'Daily at 02:00 UTC',
      status: 'queued',
      progress: 0,
      nextRun: 'In 4 hours'
    },
    {
      id: 'tsk-002',
      title: 'PostgreSQL Database Vacuum & Index Reindex',
      target: 'UBUNTU-DB-CLUSTER-01',
      schedule: 'Weekly on Sunday',
      status: 'running',
      progress: 68,
      nextRun: 'Active now'
    },
    {
      id: 'tsk-003',
      title: 'Rotate TLS Certificates across Retail POS Terminals',
      target: 'Retail Edge Outlets (14 Nodes)',
      schedule: 'Monthly',
      status: 'completed',
      progress: 100,
      nextRun: 'Aug 1, 2026'
    }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Scheduled Execution Tasks</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Automated cron tasks, daemon schedules, and background worker queues.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-google-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#80868B] uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Task ID</th>
              <th className="p-3.5">Task Description</th>
              <th className="p-3.5">Target Machine</th>
              <th className="p-3.5">Schedule</th>
              <th className="p-3.5">Status / Progress</th>
              <th className="p-3.5 text-right">Next Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="p-3.5 font-mono font-bold text-[#1A73E8]">{t.id}</td>
                <td className="p-3.5 font-bold text-[#202124]">{t.title}</td>
                <td className="p-3.5 font-medium text-[#5F6368]">{t.target}</td>
                <td className="p-3.5 font-mono text-[#202124]">{t.schedule}</td>
                <td className="p-3.5">
                  <div className="w-36 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="capitalize text-[#1A73E8]">{t.status}</span>
                      <span>{t.progress}%</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1A73E8] h-full" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                </td>
                <td className="p-3.5 text-right font-medium text-[#34A853]">{t.nextRun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
