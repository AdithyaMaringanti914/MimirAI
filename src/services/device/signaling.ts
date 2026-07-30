/**
 * @file signaling.ts
 * @description API interfaces for device registration and connection requests.
 * Uses real backend fetch calls.
 */

const API_URL = 'http://localhost:3000/api/device';

export interface DeviceRegistrationResponse {
  success: boolean;
  device?: any;
  error?: string;
}

/**
 * Registers the device on the backend server.
 * POST /api/device/register
 */
export async function registerDevice(
  deviceId: string, 
  name: string, 
  platform: string,
  passwordHash: string
): Promise<DeviceRegistrationResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceId,
      deviceName: name,
      platform,
      passwordHash,
    }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

/**
 * Requests to connect to a remote device.
 * (Placeholder for now, WebRTC negotiation happens via Socket.IO later)
 */
export async function requestConnection(_targetId: string, _passwordHash: string): Promise<{ success: boolean; token?: string; error?: string }> {
  // We'll implement actual Socket.io signaling here shortly.
  return { success: true };
}

export async function disconnectSession(_sessionId: string): Promise<boolean> {
  return true;
}
