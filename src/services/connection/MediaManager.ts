export class MediaManager {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCb: ((stream: MediaStream) => void) | null = null;

  public async startScreenCapture(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false // Screen audio not supported universally without extension, skipping for Phase 2
      });
      return this.localStream;
    } catch (err) {
      console.error('[MediaManager] Failed to start screen capture', err);
      throw err;
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public setRemoteStream(stream: MediaStream) {
    this.remoteStream = stream;
    if (this.onRemoteStreamCb) {
      this.onRemoteStreamCb(stream);
    }
  }

  public onRemoteStream(cb: (stream: MediaStream) => void) {
    this.onRemoteStreamCb = cb;
    if (this.remoteStream) {
      cb(this.remoteStream);
    }
  }

  public stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
