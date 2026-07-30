export class CancellationToken {
  private _isCancellationRequested = false;
  private callbacks: (() => void)[] = [];

  public get isCancellationRequested(): boolean {
    return this._isCancellationRequested;
  }

  public cancel() {
    this._isCancellationRequested = true;
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch (e) {
        console.error('Error in cancellation callback', e);
      }
    }
  }

  public register(callback: () => void) {
    if (this._isCancellationRequested) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  public throwIfCancelled() {
    if (this._isCancellationRequested) {
      throw new Error('Operation cancelled');
    }
  }
}
