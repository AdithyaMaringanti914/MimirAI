type IceCandidateCallback = (candidate: RTCIceCandidate) => void;
type StateChangeCallback = (state: RTCPeerConnectionState) => void;

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private onIceCandidateCb: IceCandidateCallback | null = null;
  private onStateChangeCb: StateChangeCallback | null = null;

  private readonly config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Future TURN servers can be added here
    ]
  };

  public init() {
    this.close();
    this.pc = new RTCPeerConnection(this.config);

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCb) {
        this.onIceCandidateCb(event.candidate);
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc && this.onStateChangeCb) {
        this.onStateChangeCb(this.pc.connectionState);
      }
    };
  }

  public getPeerConnection(): RTCPeerConnection {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    return this.pc;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return this.pc.localDescription!;
  }

  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return this.pc.localDescription!;
  }

  public async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    await this.pc.setRemoteDescription(sdp);
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public addStream(stream: MediaStream) {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    stream.getTracks().forEach(track => {
      this.pc!.addTrack(track, stream);
    });
  }

  public onIceCandidate(cb: IceCandidateCallback) {
    this.onIceCandidateCb = cb;
  }

  public onConnectionStateChange(cb: StateChangeCallback) {
    this.onStateChangeCb = cb;
  }

  public onTrack(cb: (event: RTCTrackEvent) => void) {
    if (this.pc) {
      this.pc.ontrack = cb;
    }
  }

  public close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
