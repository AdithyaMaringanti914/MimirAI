import { MonitorInfo } from '../domain/Monitor';

export class MonitorManager {
  private monitors: MonitorInfo[] = [];
  private activeMonitorId: string | null = null;

  public setMonitors(monitors: MonitorInfo[]) {
    this.monitors = monitors;
    if (monitors.length > 0 && !this.activeMonitorId) {
      const primary = monitors.find(m => m.isPrimary) || monitors[0];
      this.activeMonitorId = primary.id;
    }
  }

  public getActiveMonitor(): MonitorInfo | null {
    return this.monitors.find(m => m.id === this.activeMonitorId) || null;
  }

  public setActiveMonitor(id: string) {
    if (this.monitors.some(m => m.id === id)) {
      this.activeMonitorId = id;
    }
  }
}
