import { SignalingManager } from './SignalingManager';
import { SessionManager } from './SessionManager';
import { WebRTCManager } from './WebRTCManager';
import { MediaManager } from './MediaManager';
import { RemoteInputManager } from '../../managers/RemoteInputManager';
import { RTCTransport } from '../../transports/RTCTransport';
import { DesktopAgentTransport } from '../../transports/DesktopAgentTransport';
import type { RequestPayload, ApprovalPayload, OfferPayload, AnswerPayload, IcePayload } from './types/socket';
import type { Packet } from '../../protocol/Packet';

type ConnectionEvent = 'session_change' | 'remote_stream' | 'error' | 'incoming_request' | 'message';

export class ConnectionManager {
  private static instance: ConnectionManager;

  public signaling = new SignalingManager();
  public session = new SessionManager();
  public webrtc = new WebRTCManager();
  public media = new MediaManager();
  
  public rtcTransport = new RTCTransport();
  public agentTransport = new DesktopAgentTransport();
  public remoteInput = new RemoteInputManager(this.rtcTransport as any);

  private listeners: Record<string, Function[]> = {};

  private myDeviceId: string = '';

  private constructor() {
    this.setupSignalingListeners();
    this.session.onChange(() => this.emit('session_change', this.session.session));
    this.media.onRemoteStream((stream) => this.emit('remote_stream', stream));
    
    // Wire RTCTransport to RemoteInputManager by default (for Browser P2P)
    this.remoteInput.setTransport(this.rtcTransport);
    this.rtcTransport.onPacket((packet) => this.emit('message', packet));
    this.agentTransport.onPacket((packet) => this.emit('message', packet));
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public init(deviceId: string) {
    this.myDeviceId = deviceId;
    this.signaling.connect(deviceId);
  }

  // --- External API --- //

  public requestConnection(targetId: string, passwordHash: string, deviceName: string) {
    this.session.startSession(this.myDeviceId, targetId);
    this.signaling.requestConnection({ targetId, passwordHash, deviceName, platform: 'web' });
  }

  public async approveConnection(sourceId: string) {
    this.session.startSession(sourceId, this.myDeviceId);
    this.session.setStatus('approved');
    this.signaling.approveConnection({ targetId: sourceId, approved: true });

    // Host must capture screen and create Answer when Offer arrives, wait.
    try {
      this.agentTransport.attach(this.signaling, this.session.session?.sessionId || '', this.myDeviceId, sourceId);
      // Explicitly switch to Native Agent transport for this phase
      this.remoteInput.setTransport(this.agentTransport);

      const stream = await this.media.startScreenCapture();
      this.webrtc.init();
      this.webrtc.addStream(stream);
      this.setupWebRTCCallbacks(sourceId);
    } catch (err) {
      console.error(err);
      this.emit('error', { message: 'Failed to capture screen' });
      this.session.setStatus('failed');
    }
  }

  public rejectConnection(sourceId: string) {
    this.signaling.rejectConnection({ targetId: sourceId, approved: false });
  }

  public cancelConnection() {
    const s = this.session.session;
    if (s && s.status === 'waiting_approval') {
      const target = s.hostDeviceId === this.myDeviceId ? s.clientDeviceId : s.hostDeviceId;
      this.signaling.cancelConnection({ targetId: target });
      this.disconnect();
    }
  }

  public disconnect() {
    this.webrtc.close();
    this.rtcTransport.close();
    this.agentTransport.close();
    this.media.stopLocalStream();
    this.session.endSession();
  }

  // sendData is obsolete, replaced by InputService interactions with RemoteInputManager

  // --- Internal Wiring --- //

  private setupSignalingListeners() {
    this.signaling.onRequest((payload: RequestPayload) => {
      this.emit('incoming_request', payload);
    });

    this.signaling.onCancel(() => {
      this.emit('incoming_cancel', {});
    });

    this.signaling.onApproval(async (payload: ApprovalPayload) => {
      if (payload.approved) {
        this.session.setStatus('negotiating');
        
        // We are the client. Create Offer.
        this.webrtc.init();
        this.setupWebRTCCallbacks(payload.sourceId!);

        // Prepare Native Agent Transport as fallback/alternative
        this.agentTransport.attach(this.signaling, this.session.session?.sessionId || '', this.myDeviceId, payload.sourceId!);
        
        // Let's explicitly switch to agent transport for this Phase if the user connects
        this.remoteInput.setTransport(this.agentTransport);

        // Create Data Channel
        const channel = this.webrtc.getPeerConnection().createDataChannel('mimir-data', { ordered: true });
        this.rtcTransport.attach(channel, this.session.session?.sessionId || '', this.myDeviceId);

        const sdp = await this.webrtc.createOffer();
        this.signaling.sendOffer({ targetId: payload.sourceId!, sdp });
      } else {
        this.session.setStatus('failed');
        this.emit('error', { message: 'Connection rejected' });
      }
    });

    this.signaling.onOffer(async (payload: OfferPayload) => {
      if (this.session.status !== 'approved') return; // Security check
      
      this.session.setStatus('negotiating');
      await this.webrtc.setRemoteDescription(payload.sdp);
      const sdp = await this.webrtc.createAnswer();
      this.signaling.sendAnswer({ targetId: payload.sourceId!, sdp });
    });

    this.signaling.onAnswer(async (payload: AnswerPayload) => {
      await this.webrtc.setRemoteDescription(payload.sdp);
    });

    this.signaling.onIceCandidate(async (payload: IcePayload) => {
      await this.webrtc.addIceCandidate(payload.candidate);
    });

    this.signaling.onError((err) => {
      this.session.setStatus('failed');
      this.emit('error', err);
    });
  }

  private setupWebRTCCallbacks(targetId: string) {
    this.webrtc.onIceCandidate((candidate) => {
      this.signaling.sendIceCandidate({ targetId, candidate });
    });

    this.webrtc.onConnectionStateChange((state) => {
      console.log('[WebRTC] State:', state);
      if (state === 'connected') this.session.setStatus('connected');
      if (state === 'failed' || state === 'disconnected') this.session.setStatus('failed');
    });

    this.webrtc.onTrack((event) => {
      if (event.streams && event.streams[0]) {
        this.media.setRemoteStream(event.streams[0]);
      }
    });

    // If we are host receiving data channel
    const pc = this.webrtc.getPeerConnection();
    pc.ondatachannel = (event) => {
      this.rtcTransport.attach(event.channel, this.session.session?.sessionId || '', this.myDeviceId);
    };
  }

  // --- Event Emitter --- //

  public on(event: ConnectionEvent, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  private emit(event: ConnectionEvent, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const connectionManager = ConnectionManager.getInstance();
