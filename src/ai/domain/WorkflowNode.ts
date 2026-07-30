import { Action } from './Action';

export type NodeStatus = 'pending' | 'executing' | 'verified' | 'failed' | 'skipped';

export interface VerificationRule {
  type: 'VisionMatch' | 'ProcessRunning' | 'TextExists' | 'FileExists' | 'None';
  params?: any;
}

export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
}

export interface WorkflowNode {
  id: string;
  name: string;
  description: string;
  dependencies: string[]; // IDs of nodes that must complete first
  action: Action;
  expectedResult: string;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  verificationRule: VerificationRule;
  
  // Runtime State
  status: NodeStatus;
  attempts: number;
  error?: string;
  result?: any;
}

export interface Plan {
  id: string;
  goalId: string;
  nodes: WorkflowNode[];
  status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'failed';
}
