export class FrameHasher {
  public static async hash(base64Image: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64Image);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
