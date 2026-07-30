import React, { useState } from 'react';
import type { AiExecutionStep } from '../types';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Octagon,
  Send,
  Wrench,
  Download,
  Activity,
  Cpu,
  FileText,
  Brain
} from 'lucide-react';

interface AiInspectorPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  steps: AiExecutionStep[];
  onApproveStep: (stepNumber: number) => void;
  onRejectStep: (stepNumber: number) => void;
  onRetryStep: (stepNumber: number) => void;
  onStopExecution: () => void;
  onRunQuickAction: (actionName: string) => void;
}

export const AiInspectorPanel: React.FC<AiInspectorPanelProps> = ({
  isOpen,
  setIsOpen,
  steps,
  onApproveStep,
  onRejectStep,
  onRetryStep,
  onStopExecution,
  onRunQuickAction
}) => {
  const [activeTab, setActiveTab] = useState<'agent' | 'plan' | 'timeline'>('plan');
  const [userPrompt, setUserPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Mimir AI Execution Engine ready. Target machine: FIN-NODE-WIN11-PROD (982-410-381). Ready to run autonomous remediation or script workflow.',
      time: '14:40:00'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'user' as const, text: userPrompt, time };
    setChatMessages(prev => [...prev, newMsg]);
    const inputCopy = userPrompt;
    setUserPrompt('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Analyzing target node telemetry for request: "${inputCopy}". Generating safety-checked execution plan...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  const quickActions = [
    { label: 'Clean Temporary Files', icon: Wrench, action: 'Clean Temporary Files' },
    { label: 'Install Chrome', icon: Download, action: 'Install Chrome' },
    { label: 'Diagnose Network', icon: Activity, action: 'Diagnose Network' },
    { label: 'Optimize Performance', icon: Cpu, action: 'Optimize Performance' },
    { label: 'Generate Report', icon: FileText, action: 'Generate Report' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-24 bg-white border border-[#E5E7EB] border-r-0 rounded-l-xl px-2 py-3 shadow-google-md hover:bg-[#F8F9FA] text-[#1A73E8] flex flex-col items-center space-y-2 z-20 transition-all"
        title="Open AI Inspector Panel"
      >
        <Sparkles className="w-4 h-4 text-[#1A73E8]" />
        <span className="text-[10px] font-semibold tracking-wider uppercase rotate-180 [writing-mode:vertical-lr]">
          AI Inspector
        </span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#5F6368]" />
      </button>
    );
  }

  const currentStep = steps.find(s => s.status === 'running' || s.status === 'awaiting_approval') || steps[0];

  return (
    <aside className="w-96 bg-white border-l border-[#E5E7EB] flex flex-col justify-between shrink-0 z-20 h-full shadow-google-sm">
      {/* Header */}
      <div className="p-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FA]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#202124]">Mimir AI Execution Engine</h3>
            <p className="text-[10px] text-[#5F6368]">Autonomous Remote Supervision</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-[#E5E7EB] rounded-lg transition-colors"
          title="Collapse panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Intelligent Action Chips */}
      <div className="p-2.5 border-b border-[#E5E7EB] bg-white">
        <div className="text-[10px] font-semibold text-[#80868B] uppercase tracking-wider mb-2">
          Suggested AI Actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map(qa => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.label}
                onClick={() => onRunQuickAction(qa.action)}
                className="flex items-center space-x-1 bg-[#F8F9FA] hover:bg-[#E8F0FE] text-[#202124] hover:text-[#1A73E8] border border-[#E5E7EB] hover:border-[#1A73E8]/30 px-2 py-1 rounded-lg text-[11px] font-medium transition-all"
              >
                <Icon className="w-3 h-3 text-[#1A73E8]" />
                <span>{qa.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-white text-xs font-medium">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'plan'
              ? 'border-[#1A73E8] text-[#1A73E8] font-semibold bg-[#E8F0FE]/30'
              : 'border-transparent text-[#5F6368] hover:text-[#202124]'
          }`}
        >
          Execution Plan
        </button>
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'agent'
              ? 'border-[#1A73E8] text-[#1A73E8] font-semibold bg-[#E8F0FE]/30'
              : 'border-transparent text-[#5F6368] hover:text-[#202124]'
          }`}
        >
          Conversation
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-[#1A73E8] text-[#1A73E8] font-semibold bg-[#E8F0FE]/30'
              : 'border-transparent text-[#5F6368] hover:text-[#202124]'
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {/* Current Active Step Banner */}
            {currentStep && (
              <div className="p-3 bg-[#E8F0FE] border border-[#1A73E8]/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A73E8]">
                    Current Step #{currentStep.stepNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A73E8] text-white font-semibold animate-pulse">
                    {currentStep.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#202124]">{currentStep.title}</h4>
                <p className="text-[11px] text-[#5F6368] leading-relaxed">{currentStep.description}</p>

                {currentStep.commandLine && (
                  <div className="bg-[#202124] text-white p-2 rounded-lg text-[11px] font-mono overflow-x-auto">
                    <span className="text-[#34A853]">$</span> {currentStep.commandLine}
                  </div>
                )}

                {currentStep.reasoning && (
                  <div className="text-[11px] text-[#202124] bg-white/80 p-2 rounded-lg border border-[#E5E7EB] space-y-1">
                    <div className="font-semibold text-[#1A73E8] flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>AI Reasoning</span>
                    </div>
                    <p className="text-[10.5px] text-[#5F6368]">{currentStep.reasoning}</p>
                  </div>
                )}
              </div>
            )}

            {/* Global Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => currentStep && onApproveStep(currentStep.stepNumber)}
                className="bg-[#34A853] hover:bg-[#2D9247] text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Step</span>
              </button>

              <button
                onClick={() => currentStep && onRejectStep(currentStep.stepNumber)}
                className="bg-white hover:bg-[#FCE8E6] text-[#EA4335] border border-[#EA4335]/40 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => currentStep && onRetryStep(currentStep.stepNumber)}
                className="bg-[#F8F9FA] hover:bg-[#F3F4F6] text-[#202124] border border-[#E5E7EB] font-medium text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#5F6368]" />
                <span>Retry Step</span>
              </button>

              <button
                onClick={onStopExecution}
                className="bg-[#EA4335] hover:bg-[#D93025] text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Octagon className="w-3.5 h-3.5" />
                <span>Stop Execution</span>
              </button>
            </div>

            {/* Upcoming Actions Sequence */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#80868B]">
                Execution Sequence ({steps.length} Steps)
              </div>
              <div className="space-y-2">
                {steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      st.status === 'completed'
                        ? 'bg-[#E6F4EA]/40 border-[#34A853]/30'
                        : st.status === 'running'
                        ? 'bg-[#E8F0FE] border-[#1A73E8]/40'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#202124]">
                        #{st.stepNumber}. {st.title}
                      </span>
                      {st.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />}
                      {st.status === 'running' && <Clock className="w-3.5 h-3.5 text-[#1A73E8] animate-spin" />}
                      {st.status === 'pending' && <Clock className="w-3.5 h-3.5 text-[#80868B]" />}
                    </div>
                    <p className="text-[11px] text-[#5F6368]">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agent' && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1A73E8] text-white rounded-br-none'
                        : 'bg-[#F8F9FA] text-[#202124] border border-[#E5E7EB] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[#80868B] mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-[#E5E7EB]">
              <input
                type="text"
                placeholder="Ask Mimir AI to execute script or diagnose..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full bg-[#F8F9FA] text-xs text-[#202124] pl-3 pr-9 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#1A73E8] focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-3 text-[#1A73E8] hover:text-[#1557B0] p-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#80868B]">
              Execution Audit Timeline
            </div>
            <div className="relative border-l-2 border-[#E5E7EB] ml-3 pl-4 space-y-4 text-xs">
              <div className="relative">
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                <div className="font-semibold text-[#202124]">14:40:02 UTC - Session Established</div>
                <p className="text-[11px] text-[#5F6368]">Connected with TLS 1.3 handshake. Host validated.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                <div className="font-semibold text-[#202124]">14:40:15 UTC - Step 1 Completed</div>
                <p className="text-[11px] text-[#5F6368]">Process telemetry collected. Identified spooler leak.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-[#FBBC05] animate-ping" />
                <div className="font-semibold text-[#202124]">14:40:22 UTC - Step 2 In Progress</div>
                <p className="text-[11px] text-[#5F6368]">Awaiting safe print spooler service stop.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
