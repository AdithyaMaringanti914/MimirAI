import { Session, SessionStatus } from './types/session';

export class SessionManager {
  private currentSession: Session | null = null;
  private onChangeCallbacks: ((session: Session | null) => void)[] = [];

  public get session(): Session | null {
    return this.currentSession;
  }

  public get status(): SessionStatus {
    return this.currentSession?.status || 'idle';
  }

  public startSession(hostDeviceId: string, clientDeviceId: string) {
    this.currentSession = {
      sessionId: crypto.randomUUID(),
      hostDeviceId,
      clientDeviceId,
      status: 'waiting_approval',
      createdAt: Date.now()
    };
    this.notify();
  }

  public setStatus(status: SessionStatus) {
    if (this.currentSession) {
      this.currentSession.status = status;
      if (status === 'connected') {
        this.currentSession.connectedAt = Date.now();
      }
      if (status === 'disconnected' || status === 'failed') {
        this.currentSession.endedAt = Date.now();
      }
      this.notify();
    }
  }

  public endSession() {
    if (this.currentSession) {
      this.currentSession.status = 'disconnected';
      this.currentSession.endedAt = Date.now();
      this.notify();
      this.currentSession = null;
      this.notify();
    }
  }

  public onChange(cb: (session: Session | null) => void) {
    this.onChangeCallbacks.push(cb);
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notify() {
    this.onChangeCallbacks.forEach(cb => cb(this.currentSession));
  }
}
