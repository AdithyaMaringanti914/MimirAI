/**
 * @file identity.ts
 * @description Local device identity generation and persistence.
 * Permanent 9-digit Device ID and temporary 6-8 char passwords.
 */

const STORAGE_KEY_ID = 'mimir_device_id';
const STORAGE_KEY_PASSWORD = 'mimir_device_password';

/**
 * Generates a 9-digit device ID formatted as XXX-XXX-XXX
 */
export function generateDeviceId(): string {
  const segment = () => Math.floor(100 + Math.random() * 900).toString();
  return `${segment()}-${segment()}-${segment()}`;
}

/**
 * Generates a 6-character random alphanumeric password
 */
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous I, O, 1, 0
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Retrieves or generates the permanent device ID
 */
export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY_ID);
  if (!id) {
    id = generateDeviceId();
    localStorage.setItem(STORAGE_KEY_ID, id);
  }
  return id;
}

/**
 * Retrieves or generates the temporary password
 */
export function getOrCreatePassword(): string {
  let pw = localStorage.getItem(STORAGE_KEY_PASSWORD);
  if (!pw) {
    pw = generatePassword();
    localStorage.setItem(STORAGE_KEY_PASSWORD, pw);
  }
  return pw;
}

/**
 * Generates and stores a new temporary password
 */
export function refreshLocalPassword(): string {
  const pw = generatePassword();
  localStorage.setItem(STORAGE_KEY_PASSWORD, pw);
  return pw;
}

/**
 * Wipes the identity completely (Hard reset)
 */
export function resetIdentity(): void {
  localStorage.removeItem(STORAGE_KEY_ID);
  localStorage.removeItem(STORAGE_KEY_PASSWORD);
}
