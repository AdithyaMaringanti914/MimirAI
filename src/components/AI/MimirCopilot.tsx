import React, { useState, useRef, useEffect } from 'react';
import { Bot, Play, Loader2, StopCircle } from 'lucide-react';
import { IntentAnalyzer } from '../../ai/engines/IntentAnalyzer';
import { ExecutionCoordinator } from '../../ai/engines/ExecutionCoordinator';
import { type SceneGraph } from '../../ai/domain/SceneGraph';

export const MimirCopilot: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: string; msg: string; type: 'info' | 'scene' | 'error' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info' | 'scene' | 'error' = 'info') => {
    setLogs(prev => [...prev, { id: crypto.randomUUID(), msg, type }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleExecute = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);
    setLogs([]);
    addLog(`Analyzing Intent: "${input}"`);

    try {
      const intentAnalyzer = new IntentAnalyzer();
      const coordinator = new ExecutionCoordinator();

      const goal = await intentAnalyzer.analyze(input);
      addLog(`Goal parsed: ${goal.description}`);

      await coordinator.executeGoal(
        goal,
        (msg) => addLog(msg),
        (scene: SceneGraph) => addLog(`SceneGraph Built: ${scene.controls.length} controls found`, 'scene')
      );

    } catch (err: any) {
      console.error('Copilot Error:', err);
      addLog(`AI Execution Failed: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E293B] border-l border-[#334155] w-96 text-white overflow-hidden shadow-2xl z-50 rounded-l-2xl">
      <div className="p-4 border-b border-[#334155] flex items-center space-x-3 bg-[#0F172A]">
        <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Mimir Vision AI</h3>
          <p className="text-[11px] text-[#94A3B8]">Perception-Driven Execution (Phase 6)</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px]">
        {logs.map(log => (
          <div 
            key={log.id} 
            className={`p-2 rounded border ${
              log.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              log.type === 'scene' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
              'bg-[#0F172A] border-[#334155] text-[#CBD5E1]'
            }`}
          >
            {log.msg}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-[#94A3B8] p-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI is reasoning...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#334155] bg-[#0F172A]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Open Calculator"
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#1A73E8] resize-none h-20"
          />
          <button
            onClick={handleExecute}
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-[#1A73E8] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#1557B0] transition-colors"
          >
            {isProcessing ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
