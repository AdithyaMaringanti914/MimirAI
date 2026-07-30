import { io, Socket } from 'socket.io-client';
import type { 
  RequestPayload, 
  ApprovalPayload, 
  OfferPayload, 
  AnswerPayload, 
  IcePayload 
} from './types/socket';

type EventCallback<T> = (data: T) => void;

export class SignalingManager {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:3000';

  public connect(deviceId: string) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(this.serverUrl);
    
    this.socket.on('connect', () => {
      console.log('[Signaling] Connected to backend');
      this.socket?.emit('device:register', { deviceId });
    });

    this.socket.on('disconnect', () => {
      console.log('[Signaling] Disconnected from backend');
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Emit Methods --- //

  public requestConnection(payload: RequestPayload) {
    console.log('[Signaling] Sending device:request', payload.targetId);
    this.socket?.emit('device:request', payload);
  }

  public approveConnection(payload: ApprovalPayload) {
    this.socket?.emit('device:approval', payload);
  }

  public rejectConnection(payload: ApprovalPayload) {
    this.socket?.emit('device:reject', payload);
  }

  public cancelConnection(payload: { targetId: string }) {
    this.socket?.emit('device:cancel', payload);
  }

  public sendOffer(payload: OfferPayload) {
    this.socket?.emit('device:offer', payload);
  }

  public sendAnswer(payload: AnswerPayload) {
    this.socket?.emit('device:answer', payload);
  }

  public sendIceCandidate(payload: IcePayload) {
    this.socket?.emit('device:ice', payload);
  }

  // --- Agent Methods --- //

  public sendAgentCommand(payload: { targetId: string; packet: string }) {
    this.socket?.emit('agent:command', payload);
  }

  public onAgentResponse(cb: EventCallback<{ sourceId: string; response: any }>) {
    this.socket?.on('agent:response', cb);
  }

  public offAgentResponse(cb: EventCallback<{ sourceId: string; response: any }>) {
    this.socket?.off('agent:response', cb);
  }

  // --- Listen Methods --- //

  public onRequest(cb: EventCallback<RequestPayload>) {
    this.socket?.on('device:request', cb);
  }

  public onApproval(cb: EventCallback<ApprovalPayload>) {
    this.socket?.on('device:approval', cb);
  }

  public onReject(cb: EventCallback<ApprovalPayload>) {
    this.socket?.on('device:reject', cb);
  }

  public onCancel(cb: EventCallback<{ sourceId: string }>) {
    this.socket?.on('device:cancel', cb);
  }

  public onOffer(cb: EventCallback<OfferPayload>) {
    this.socket?.on('device:offer', cb);
  }

  public onAnswer(cb: EventCallback<AnswerPayload>) {
    this.socket?.on('device:answer', cb);
  }

  public onIceCandidate(cb: EventCallback<IcePayload>) {
    this.socket?.on('device:ice', cb);
  }

  public onError(cb: EventCallback<{ message: string, code?: string }>) {
    this.socket?.on('DEVICE_NOT_FOUND', () => cb({ message: 'Device not found' }));
    this.socket?.on('DEVICE_OFFLINE', () => cb({ message: 'Device offline' }));
  }
}
