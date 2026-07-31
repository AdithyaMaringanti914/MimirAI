/**
 * @file heartbeat.ts
 * @description Background service that pings the real backend.
 */

const API_URL = (import.meta.env.VITE_API_URL || 'https://mimirai-production.up.railway.app') + '/api/device';

/**
 * Sends a heartbeat to the server.
 * POST /api/device/heartbeat
 */
export async function sendHeartbeat(deviceId: string, _status: string, _stats: any): Promise<void> {
  const response = await fetch(`${API_URL}/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceId,
      connectionQuality: 'excellent'
    }),
  });

  if (!response.ok) {
    throw new Error('Heartbeat failed');
  }
}
