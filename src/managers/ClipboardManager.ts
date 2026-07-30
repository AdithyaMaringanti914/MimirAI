import { ClipboardEvent } from '../domain/ClipboardEvent';

export class ClipboardManager {
  private lastCopiedData: string = '';

  public onRemoteClipboardReceived(event: ClipboardEvent) {
    if (event.data && event.data !== this.lastCopiedData) {
      this.lastCopiedData = event.data;
      // Triggers actual DOM paste via ClipboardService later
    }
  }

  public setLocalCopiedData(data: string) {
    this.lastCopiedData = data;
  }
}
