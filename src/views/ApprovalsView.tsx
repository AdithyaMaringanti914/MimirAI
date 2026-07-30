import React from 'react';
import type { ApprovalRequest } from '../types';
import { CheckCircle2, XCircle, Brain } from 'lucide-react';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ approvals, onApprove, onReject }) => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#EA4335] bg-[#FCE8E6] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Zero-Trust Security Gatekeeper
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#202124] mt-1 tracking-tight">
            Pending Admin Approval Queue ({approvals.filter(a => a.status === 'pending').length})
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Review and sign off on high-privilege remote command executions flagged by AI guardrails.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {approvals.map((app) => (
          <div
            key={app.id}
            className={`p-5 rounded-2xl border bg-white shadow-google-sm space-y-4 transition-all ${
              app.status === 'pending'
                ? 'border-[#EA4335]/40'
                : app.status === 'approved'
                ? 'border-[#34A853]/40'
                : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#1A73E8] bg-[#E8F0FE] px-2 py-0.5 rounded">
                    {app.id}
                  </span>
                  <span className="text-xs text-[#80868B]">{app.timestamp}</span>
                </div>
                <h3 className="text-sm font-bold text-[#202124]">{app.taskTitle}</h3>
                <p className="text-xs text-[#5F6368]">
                  Requested by <strong className="text-[#202124]">{app.requestedBy}</strong> on target <strong className="text-[#202124]">{app.targetDevice}</strong>
                </p>
              </div>

              {/* Safety Score Meter */}
              <div className="text-right">
                <div className="text-xs text-[#5F6368] font-medium">Safety Score</div>
                <div className="text-lg font-bold text-[#34A853]">{app.riskScore} / 100</div>
                <div className="text-[10px] text-[#34A853] font-semibold">Low Risk</div>
              </div>
            </div>

            {/* Command Line Box */}
            <div className="bg-[#202124] text-white p-3 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-[#34A853] mb-1"># Command Line Sandbox Preview</div>
              <div>$ {app.commandLine}</div>
            </div>

            {/* AI Reasoning */}
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] text-xs space-y-1">
              <div className="font-bold text-[#1A73E8] flex items-center space-x-1">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Automated Risk &amp; Justification Analysis</span>
              </div>
              <p className="text-[11.5px] text-[#5F6368] leading-relaxed">{app.reasoning}</p>
            </div>

            {/* Buttons */}
            {app.status === 'pending' ? (
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() => onReject(app.id)}
                  className="bg-white hover:bg-[#FCE8E6] text-[#EA4335] border border-[#EA4335]/40 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Execution</span>
                </button>

                <button
                  onClick={() => onApprove(app.id)}
                  className="bg-[#34A853] hover:bg-[#2D9247] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Dispatch</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#E5E7EB] text-xs font-bold capitalize text-[#34A853] flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{app.status}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
