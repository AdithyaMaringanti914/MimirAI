import React, { useState } from 'react';
import type { WorkflowTemplate } from '../types';
import {
  Workflow,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Layers
} from 'lucide-react';

interface AutomationViewProps {
  workflows: WorkflowTemplate[];
  onRunWorkflow: (wf: WorkflowTemplate) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({ workflows, onRunWorkflow }) => {
  const [nlPrompt, setNlPrompt] = useState('');

  const handleGenerateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#1A73E8] bg-[#E8F0FE] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Visual Workflow Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#202124] mt-1 tracking-tight">
            Autonomous Workflows &amp; AI Prompt Studio
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Construct multi-node execution sequences using natural language or visual DAG node blocks.
          </p>
        </div>
      </div>

      {/* Natural Language Prompt Builder Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#1A73E8]" />
          <h2 className="text-sm font-bold text-[#202124]">Natural Language Autonomous Prompt Input</h2>
        </div>

        <form onSubmit={handleGenerateWorkflow} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., 'Patch OpenSSL on all Linux production database hosts, restart service safely, and notify Slack'..."
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            className="flex-1 bg-[#F8F9FA] text-xs text-[#202124] px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white"
          />
          <button
            type="submit"
            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Synthesize DAG Workflow</span>
          </button>
        </form>
      </div>

      {/* Interactive Visual Node Workflow Canvas Simulation */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-[#1A73E8]" />
            <h2 className="text-sm font-bold text-[#202124]">Visual Execution Node Canvas</h2>
          </div>
          <span className="text-xs text-[#34A853] font-semibold bg-[#E6F4EA] px-2.5 py-1 rounded-full">
            Ready to Execute
          </span>
        </div>

        {/* Visual Node Chain */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-[#F8F9FA] rounded-2xl border border-[#E5E7EB] overflow-x-auto">
          {/* Node 1 */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-google-sm w-full md:w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A73E8]">
              <span>Step 1: Trigger</span>
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#202124]">Node Event Listener</h4>
            <p className="text-[11px] text-[#5F6368]">Target Group: Production DB Cluster</p>
          </div>

          <ArrowRight className="w-5 h-5 text-[#80868B] shrink-0 rotate-90 md:rotate-0" />

          {/* Node 2 */}
          <div className="bg-white p-4 rounded-xl border border-[#1A73E8]/40 shadow-google-sm w-full md:w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A73E8]">
              <span>Step 2: AI Reasoning</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#202124]">Telemetry Audit</h4>
            <p className="text-[11px] text-[#5F6368]">Validates safety guardrail &amp; OpenSSL version</p>
          </div>

          <ArrowRight className="w-5 h-5 text-[#80868B] shrink-0 rotate-90 md:rotate-0" />

          {/* Node 3 */}
          <div className="bg-white p-4 rounded-xl border border-[#FBBC05]/40 shadow-google-sm w-full md:w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#FBBC05]">
              <span>Step 3: Approval Gate</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#202124]">Admin Security Sign-off</h4>
            <p className="text-[11px] text-[#5F6368]">Risk score: 88/100 (Safe)</p>
          </div>

          <ArrowRight className="w-5 h-5 text-[#80868B] shrink-0 rotate-90 md:rotate-0" />

          {/* Node 4 */}
          <div className="bg-white p-4 rounded-xl border border-[#34A853]/40 shadow-google-sm w-full md:w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#34A853]">
              <span>Step 4: Command</span>
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#202124]">Remote Hot-Patch</h4>
            <p className="text-[11px] text-[#5F6368]">sudo apt-get upgrade openssl</p>
          </div>
        </div>
      </div>

      {/* Reusable Templates Library */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
        <h2 className="text-sm font-bold text-[#202124]">Reusable Enterprise Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map(wf => (
            <div key={wf.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#1A73E8]/40 transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#1A73E8] bg-[#E8F0FE] px-2 py-0.5 rounded uppercase">
                  {wf.category}
                </span>
                <h3 className="text-xs font-bold text-[#202124]">{wf.title}</h3>
                <p className="text-[11px] text-[#5F6368]">{wf.description}</p>
              </div>

              <button
                onClick={() => onRunWorkflow(wf)}
                className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
