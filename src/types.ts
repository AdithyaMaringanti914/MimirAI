export type NavigationTab =
  | 'dashboard'
  | 'devices'
  | 'sessions'
  | 'address-book'
  | 'automation'
  | 'tasks'
  | 'approvals'
  | 'analytics'
  | 'files'
  | 'ai-memory'
  | 'logs'
  | 'settings'
  | 'profile';

export type DeviceStatus = 'online' | 'idle' | 'offline';
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'ubuntu' | 'android';
export type TrustLevel = 'verified' | 'pending' | 'guest';

export interface Device {
  id: string;
  rustDeskId: string;
  name: string;
  hostname: string;
  os: OperatingSystem;
  osVersion: string;
  status: DeviceStatus;
  trustLevel: TrustLevel;
  ipAddress: string;
  macAddress: string;
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
  latencyMs: number;
  lastSeen: string;
  group: string;
  tags: string[];
}

export interface ActiveSession {
  id: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  os: OperatingSystem;
  operator: string;
  startTime: string;
  duration: string;
  fps: number;
  latencyMs: number;
  bandwidthMbps: number;
  status: 'active' | 'paused' | 'ending';
  isRecorded: boolean;
}

export interface ApprovalRequest {
  id: string;
  taskTitle: string;
  requestedBy: string;
  targetDevice: string;
  commandLine: string;
  riskScore: number; // 0-100 (higher = safer)
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  reasoning: string;
}

export interface FileTransferItem {
  id: string;
  fileName: string;
  size: string;
  source: string;
  destination: string;
  progress: number;
  speed: string;
  status: 'transferring' | 'completed' | 'queued' | 'failed';
}

export interface AiExecutionStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'running' | 'pending' | 'failed' | 'awaiting_approval';
  commandLine?: string;
  reasoning?: string;
  output?: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'deployment' | 'diagnostics';
  stepsCount: number;
  runsCount: number;
  lastUsed: string;
}
