import { z } from 'zod';

export const DataMessageSchema = z.object({
  type: z.enum(['MOUSE_MOVE', 'MOUSE_DOWN', 'MOUSE_UP', 'MOUSE_WHEEL', 'KEY_DOWN', 'KEY_UP', 'CLIPBOARD']),
  payload: z.any(),
});

export type DataMessage = z.infer<typeof DataMessageSchema>;
