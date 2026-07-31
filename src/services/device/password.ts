/**
 * @file password.ts
 * @description API interfaces for managing device passwords remotely using the real backend.
 */

const API_URL = (import.meta.env.VITE_API_URL || 'https://mimirai-production.up.railway.app') + '/api/device';

/**
 * Syncs the local password change to the backend.
 * POST /api/device/password
 */
export async function syncPassword(deviceId: string, newPasswordHash: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceId,
      newHash: newPasswordHash
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to sync password');
  }
  
  return true;
}
