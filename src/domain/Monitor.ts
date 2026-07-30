import { Resolution } from './Resolution';

export interface MonitorInfo {
  id: string;
  name: string;
  isPrimary: boolean;
  resolution: Resolution;
  offsetX: number;
  offsetY: number;
}
