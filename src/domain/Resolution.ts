import { RemoteInput } from './RemoteInput';

export interface Resolution {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface ScreenResizeEvent extends RemoteInput {
  type: 'screen.resize';
  resolution: Resolution;
}
