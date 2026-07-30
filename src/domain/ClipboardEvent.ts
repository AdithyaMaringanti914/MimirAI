import { RemoteInput } from './RemoteInput';

export interface ClipboardEvent extends RemoteInput {
  type: 'clipboard.copy' | 'clipboard.paste';
  format: 'text/plain' | 'image/png';
  data: string; // Base64 if image, raw string if text
}
