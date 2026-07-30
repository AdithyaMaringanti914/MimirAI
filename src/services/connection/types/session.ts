export type SessionStatus = 
  | 'idle'
  | 'waiting_approval'
  | 'approved'
  | 'negotiating'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'disconnected'
  | 'failed';

export interface Session {
  sessionId: string;
  hostDeviceId: string;
  clientDeviceId: string;
  status: SessionStatus;
  createdAt: number;
  connectedAt?: number;
  endedAt?: number;
}
