import { z } from 'zod';

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  deviceName: z.string().min(1),
  platform: z.string().min(1),
  architecture: z.string().optional(),
  osVersion: z.string().optional(),
  passwordHash: z.string().min(1), // In a real app this is the bcrypt hash of the plaintext generated on the client
});

export const heartbeatSchema = z.object({
  deviceId: z.string().min(1),
  publicIp: z.string().optional(),
  connectionQuality: z.string().optional(),
});

export const rotatePasswordSchema = z.object({
  deviceId: z.string().min(1),
  newHash: z.string().min(1),
});
