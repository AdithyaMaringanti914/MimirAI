import { z } from 'zod';

export const PacketSchema = z.object({
  version: z.literal('1.0'),
  messageId: z.string().uuid(),
  timestamp: z.number(),
  sessionId: z.string(),
  deviceId: z.string(),
  type: z.enum([
    'mouse.move', 'mouse.down', 'mouse.up', 'mouse.doubleClick', 'mouse.scroll',
    'mouse.dragStart', 'mouse.dragMove', 'mouse.dragEnd',
    'keyboard.down', 'keyboard.up',
    'clipboard.copy', 'clipboard.paste',
    'cursor.position', 'screen.resize',
    'ping', 'pong'
  ]),
  payload: z.any()
});

export type Packet = z.infer<typeof PacketSchema>;
