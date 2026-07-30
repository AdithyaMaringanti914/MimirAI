import { type Resolution } from '../domain/Resolution';

export class CoordinateNormalizer {
  private localResolution: Resolution = { width: 1920, height: 1080, devicePixelRatio: 1 };
  private remoteResolution: Resolution = { width: 1920, height: 1080, devicePixelRatio: 1 };
  
  public setLocalResolution(res: Resolution) {
    this.localResolution = res;
  }

  public setRemoteResolution(res: Resolution) {
    this.remoteResolution = res;
  }

  /**
   * Translates an X/Y coordinate from the local browser video element
   * to the absolute coordinate on the remote OS monitor.
   */
  public normalize(localX: number, localY: number): { x: number, y: number } {
    // Prevent division by zero
    if (this.localResolution.width === 0 || this.localResolution.height === 0) {
      return { x: 0, y: 0 };
    }

    const scaleX = this.remoteResolution.width / this.localResolution.width;
    const scaleY = this.remoteResolution.height / this.localResolution.height;

    // Apply scale and remote DPI ratio
    const normalizedX = Math.round(localX * scaleX * this.remoteResolution.devicePixelRatio);
    const normalizedY = Math.round(localY * scaleY * this.remoteResolution.devicePixelRatio);

    return { x: normalizedX, y: normalizedY };
  }
}
