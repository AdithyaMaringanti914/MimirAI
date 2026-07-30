type EventHandler = (payload: any) => void | Promise<void>;

export class EventBus {
  private static handlers = new Map<string, EventHandler[]>();

  public static subscribe(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  public static unsubscribe(event: string, handler: EventHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(event, handlers.filter(h => h !== handler));
    }
  }

  public static async publish(event: string, payload: any): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    // The prompt specified "asynchronous event bus", so we fire them concurrently.
    const promises = handlers.map(async (handler) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error in handler for event '${event}':`, err);
      }
    });
    await Promise.allSettled(promises);
  }
}
