import { ClipboardManager } from '../managers/ClipboardManager';
import { RemoteInputManager } from '../managers/RemoteInputManager';

export class ClipboardService {
  private inputManager: RemoteInputManager;
  private pollInterval: number | null = null;
  private lastLocalText = '';

  constructor(_manager: ClipboardManager, inputManager: RemoteInputManager) {
    this.inputManager = inputManager;
  }

  public attach() {
    // We cannot reliably listen to 'copy'/'paste' globally because it requires user interaction.
    // Instead we can poll navigator.clipboard if we have permissions, or wait for explicit actions.
    window.addEventListener('copy', this.onLocalCopy);
  }

  public detach() {
    window.removeEventListener('copy', this.onLocalCopy);
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private onLocalCopy = async (_e: globalThis.ClipboardEvent) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text !== this.lastLocalText) {
        this.lastLocalText = text;
        this.inputManager.dispatchClipboard({
          type: 'clipboard.copy',
          timestamp: 0,
          format: 'text/plain',
          data: text
        } as any); // cast for now
      }
    } catch (err) {
      console.warn('Failed to read clipboard on copy', err);
    }
  };

  public async syncRemoteToLocal(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.lastLocalText = text;
    } catch (err) {
      console.error('Failed to write to local clipboard', err);
    }
  }
}
