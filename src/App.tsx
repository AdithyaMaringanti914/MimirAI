import { useState, useEffect } from 'react';
import type { NavigationTab, Device, ActiveSession, ApprovalRequest, AiExecutionStep, FileTransferItem, WorkflowTemplate } from './types';
import {
  INITIAL_DEVICES,
  INITIAL_SESSIONS,
  INITIAL_APPROVALS,
  INITIAL_AI_STEPS,
  INITIAL_FILE_TRANSFERS,
  WORKFLOW_TEMPLATES
} from './data/mockData';

import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { AiInspectorPanel } from './components/AiInspectorPanel';
import { BottomDock } from './components/BottomDock';
import { StatusBar } from './components/StatusBar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { IncomingConnectionDialog } from './components/IncomingConnectionDialog';

import { HostIdentityProvider } from './context/HostIdentityContext';
import { useConnectionManager } from './hooks/useConnectionManager';

import { DashboardView } from './views/DashboardView';
import { RemoteSessionView } from './views/RemoteSessionView';
import { DevicesView } from './views/DevicesView';
import { SessionsView } from './views/SessionsView';
import { AddressBookView } from './views/AddressBookView';
import { AutomationView } from './views/AutomationView';
import { TasksView } from './views/TasksView';
import { ApprovalsView } from './views/ApprovalsView';
import { AnalyticsView } from './views/AnalyticsView';
import { FileTransferView } from './views/FileTransferView';
import { AiMemoryView } from './views/AiMemoryView';
import { LogsView } from './views/LogsView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [workspace, setWorkspace] = useState('Global Infrastructure');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [bottomDockExpanded, setBottomDockExpanded] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // App Data State
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [aiSteps, setAiSteps] = useState<AiExecutionStep[]>(INITIAL_AI_STEPS);
  const [transfers] = useState<FileTransferItem[]>(INITIAL_FILE_TRANSFERS);
  const [workflows] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);

  // Active Remote Desktop Session state
  const [activeRemoteDevice, setActiveRemoteDevice] = useState<Device | null>(null);

  // Toast Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Connect WebRTC logic to UI transitions
  const { session, manager } = useConnectionManager();

  useEffect(() => {
    if (session?.status === 'connected' && !activeRemoteDevice) {
      // Transition to active remote session
      const targetId = session.hostDeviceId === manager['myDeviceId'] ? session.clientDeviceId : session.hostDeviceId;
      setActiveRemoteDevice({
        id: targetId,
        rustDeskId: targetId,
        name: `Node ${targetId}`,
        hostname: `${targetId}.mimir.net`,
        os: 'windows',
        osVersion: 'Windows',
        status: 'online',
        trustLevel: 'verified',
        ipAddress: 'Unknown',
        macAddress: '',
        cpuUsage: 0,
        ramUsage: 0,
        storageUsage: 0,
        latencyMs: 0,
        lastSeen: 'Now',
        group: 'Session',
        tags: []
      });
      setActiveTab('sessions');
      showToast('WebRTC Peer Connection Established.');
    } else if (session?.status === 'disconnected' || session?.status === 'failed') {
      if (activeRemoteDevice) {
        handleEndSession();
        showToast(session.status === 'failed' ? 'Connection failed' : 'Session ended');
      }
    }
  }, [session?.status]);

  // Handlers
  const handleStartSession = (device: Device) => {
    setActiveRemoteDevice(device);
    setActiveTab('sessions');
    showToast(`Remote screen session initiated with ${device.name} (${device.rustDeskId})`);
  };

  const handleEndSession = (sessionId?: string) => {
    manager.disconnect();
    setActiveRemoteDevice(null);
    if (sessionId) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
    setActiveTab('dashboard');
    showToast('Remote desktop session gracefully terminated.');
  };

  const handleQuickConnect = (rustDeskId: string) => {
    const target = devices.find(d => d.rustDeskId === rustDeskId || d.id === rustDeskId || d.ipAddress === rustDeskId);
    if (target) {
      handleStartSession(target);
    } else {
      // Create new session target
      const newDev: Device = {
        id: `dev-${Date.now()}`,
        rustDeskId: rustDeskId,
        name: `REMOTE-NODE-${rustDeskId.slice(-4)}`,
        hostname: `remote-${rustDeskId}.mimir.net`,
        os: 'windows',
        osVersion: 'Windows 11 Enterprise',
        status: 'online',
        trustLevel: 'verified',
        ipAddress: '10.240.50.99',
        macAddress: '00:11:22:33:44:55',
        cpuUsage: 14,
        ramUsage: 38,
        storageUsage: 50,
        latencyMs: 16,
        lastSeen: 'Just now',
        group: 'Quick Connect Nodes',
        tags: ['Direct-Session']
      };
      setDevices(prev => [newDev, ...prev]);
      handleStartSession(newDev);
    }
  };

  const handleApproveStep = (stepNumber: number) => {
    setAiSteps(prev =>
      prev.map(s => (s.stepNumber === stepNumber ? { ...s, status: 'completed' } : s))
    );
    showToast(`AI Step #${stepNumber} approved & dispatched to daemon.`);
  };

  const handleRejectStep = (stepNumber: number) => {
    setAiSteps(prev =>
      prev.map(s => (s.stepNumber === stepNumber ? { ...s, status: 'failed' } : s))
    );
    showToast(`AI Step #${stepNumber} rejected.`);
  };

  const handleRetryStep = (stepNumber: number) => {
    setAiSteps(prev =>
      prev.map(s => (s.stepNumber === stepNumber ? { ...s, status: 'running' } : s))
    );
    showToast(`Retrying AI Step #${stepNumber}...`);
  };

  const handleStopExecution = () => {
    setAiSteps(prev => prev.map(s => ({ ...s, status: 'failed' })));
    showToast('Emergency Stop issued to remote daemon.');
  };

  const handleRunQuickAiAction = (actionName: string) => {
    const newStep: AiExecutionStep = {
      stepNumber: aiSteps.length + 1,
      title: `Autonomous Action: ${actionName}`,
      description: `Dispatched pre-certified security recipe "${actionName}" to target host.`,
      status: 'running',
      commandLine: `mimir-agent --action "${actionName.toLowerCase().replace(/ /g, '_')}" --safety-check strict`,
      reasoning: `Executing automated remediation recipe "${actionName}" per policy rule #902.`
    };
    setAiSteps(prev => [newStep, ...prev]);
    showToast(`Executing AI Action: "${actionName}"`);
  };

  const handleApproveSecurity = (id: string) => {
    setApprovals(prev => prev.map(a => (a.id === id ? { ...a, status: 'approved' } : a)));
    showToast(`Command approval granted for ${id}.`);
  };

  const handleRejectSecurity = (id: string) => {
    setApprovals(prev => prev.map(a => (a.id === id ? { ...a, status: 'rejected' } : a)));
    showToast(`Command ${id} rejected.`);
  };

  const handleRunWorkflow = (wf: WorkflowTemplate) => {
    showToast(`Launching visual workflow: "${wf.title}" across 4 target nodes.`);
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <HostIdentityProvider>
      <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden font-sans selection:bg-[#E8F0FE] selection:text-[#1A73E8]">
        {/* Toast Banner */}
        {toastMessage && (
          <div className="fixed top-14 right-6 bg-[#202124] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-google-lg z-50 flex items-center space-x-2 border border-gray-700 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Window Titlebar */}
        <TitleBar
          workspace={workspace}
          setWorkspace={setWorkspace}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onQuickConnect={handleQuickConnect}
          activeSessionCount={activeRemoteDevice ? sessions.length + 1 : sessions.length}
        />

        {/* Center Body: Sidebar + Main Workspace + AI Inspector Panel */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
            }}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            pendingApprovalsCount={pendingApprovalsCount}
            activeSessionsCount={activeRemoteDevice ? sessions.length + 1 : sessions.length}
            runningTasksCount={2}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA] relative">
            {activeTab === 'sessions' && activeRemoteDevice ? (
              <RemoteSessionView
                device={activeRemoteDevice}
                onEndSession={() => handleEndSession()}
                onOpenAiPanel={() => setAiPanelOpen(true)}
                onOpenFileTransfer={() => setActiveTab('files')}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    devices={devices}
                    sessions={sessions}
                    pendingApprovalsCount={pendingApprovalsCount}
                    workflows={workflows}
                    onStartSession={handleStartSession}
                    onQuickConnect={handleQuickConnect}
                    onRunWorkflow={handleRunWorkflow}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'devices' && (
                  <DevicesView
                    devices={devices}
                    onStartSession={handleStartSession}
                    onRunAiAction={(dev) => {
                      handleRunQuickAiAction(`Diagnose Node ${dev.name}`);
                      setAiPanelOpen(true);
                    }}
                    onOpenFileTransfer={() => setActiveTab('files')}
                  />
                )}

                {activeTab === 'sessions' && (
                  <SessionsView
                    sessions={sessions}
                    onEndSession={handleEndSession}
                  />
                )}

                {activeTab === 'address-book' && (
                  <AddressBookView
                    devices={devices}
                    onStartSession={handleStartSession}
                  />
                )}

                {activeTab === 'automation' && (
                  <AutomationView
                    workflows={workflows}
                    onRunWorkflow={handleRunWorkflow}
                  />
                )}

                {activeTab === 'tasks' && <TasksView />}

                {activeTab === 'approvals' && (
                  <ApprovalsView
                    approvals={approvals}
                    onApprove={handleApproveSecurity}
                    onReject={handleRejectSecurity}
                  />
                )}

                {activeTab === 'analytics' && <AnalyticsView />}

                {activeTab === 'files' && <FileTransferView transfers={transfers} />}

                {activeTab === 'ai-memory' && <AiMemoryView />}

                {activeTab === 'logs' && <LogsView />}

                {activeTab === 'settings' && <SettingsView />}

                {activeTab === 'profile' && <ProfileView />}
              </>
            )}

            {/* Bottom Panel Dock */}
            <BottomDock
              isExpanded={bottomDockExpanded}
              setIsExpanded={setBottomDockExpanded}
              transfers={transfers}
            />
          </main>

          {/* Right Collapsible AI Inspector Panel */}
          <AiInspectorPanel
            isOpen={aiPanelOpen}
            setIsOpen={setAiPanelOpen}
            steps={aiSteps}
            onApproveStep={handleApproveStep}
            onRejectStep={handleRejectStep}
            onRetryStep={handleRetryStep}
            onStopExecution={handleStopExecution}
            onRunQuickAction={handleRunQuickAiAction}
          />
        </div>

        {/* Bottom Status Bar */}
        <StatusBar
          deviceCount={devices.length}
          activeSessionCount={activeRemoteDevice ? sessions.length + 1 : sessions.length}
          aiEngineStatus="Supervising 2 Nodes (99.4% Precision)"
        />

        {/* Global Modals & Dialogs */}
        <CommandPaletteModal
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSelectTab={setActiveTab}
          onQuickConnect={handleQuickConnect}
          onRunAiAction={(act) => {
            handleRunQuickAiAction(act);
            setAiPanelOpen(true);
          }}
        />
        
        {/* Connection Dialog triggers on incoming request */}
        <IncomingConnectionDialog />
      </div>
    </HostIdentityProvider>
  );
}

export default App;
