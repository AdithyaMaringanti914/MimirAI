import { db } from '../config/db';
import { logger } from '../utils/logger';

export const upsertDevice = async (device: {
  deviceId: string;
  deviceName: string;
  platform: string;
  architecture?: string;
  osVersion?: string;
  passwordHash: string;
  publicIp?: string;
}) => {
  const query = `
    INSERT INTO devices ("deviceId", "deviceName", "platform", "architecture", "osVersion", "passwordHash", "publicIp", "status")
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'online')
    ON CONFLICT ("deviceId") DO UPDATE SET
      "deviceName" = EXCLUDED."deviceName",
      "platform" = EXCLUDED."platform",
      "architecture" = EXCLUDED."architecture",
      "osVersion" = EXCLUDED."osVersion",
      "passwordHash" = EXCLUDED."passwordHash",
      "publicIp" = EXCLUDED."publicIp",
      "status" = 'online',
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING id, "deviceId", "deviceName";
  `;
  const values = [
    device.deviceId,
    device.deviceName,
    device.platform,
    device.architecture,
    device.osVersion,
    device.passwordHash,
    device.publicIp
  ];

  const res = await db.query(query, values);
  return res.rows[0];
};

export const recordHeartbeat = async (deviceId: string, publicIp?: string, connectionQuality?: string) => {
  // Update device lastHeartbeat and status
  const updateDeviceQuery = `
    UPDATE devices
    SET "lastHeartbeat" = CURRENT_TIMESTAMP, "status" = 'online', "lastSeen" = CURRENT_TIMESTAMP, "publicIp" = COALESCE($2, "publicIp")
    WHERE "deviceId" = $1
    RETURNING "deviceId";
  `;
  await db.query(updateDeviceQuery, [deviceId, publicIp]);

  // Insert into heartbeats log
  const insertHbQuery = `
    INSERT INTO heartbeats ("deviceId", "publicIp", "connectionQuality")
    VALUES ($1, $2, $3);
  `;
  await db.query(insertHbQuery, [deviceId, publicIp, connectionQuality]);
};

export const updatePassword = async (deviceId: string, newHash: string) => {
  // Get old hash first
  const getOldHashQuery = `SELECT "passwordHash" FROM devices WHERE "deviceId" = $1`;
  const res = await db.query(getOldHashQuery, [deviceId]);
  if (res.rows.length === 0) throw new Error('Device not found');
  
  const oldHash = res.rows[0].passwordHash;

  // Update password
  const updateQuery = `
    UPDATE devices SET "passwordHash" = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE "deviceId" = $1
  `;
  await db.query(updateQuery, [deviceId, newHash]);

  // Record rotation
  const logRotationQuery = `
    INSERT INTO password_rotations ("deviceId", "oldHash", "newHash")
    VALUES ($1, $2, $3);
  `;
  await db.query(logRotationQuery, [deviceId, oldHash, newHash]);
};

export const getDeviceById = async (deviceId: string) => {
  const query = `
    SELECT "deviceId", "deviceName", "platform", "status", "lastHeartbeat", "lastSeen"
    FROM devices
    WHERE "deviceId" = $1
  `;
  const res = await db.query(query, [deviceId]);
  return res.rows[0];
};

export const getRecentDevices = async (limit: number = 10) => {
  const query = `
    SELECT "deviceId", "deviceName", "platform", "status", "lastSeen"
    FROM devices
    ORDER BY "lastSeen" DESC NULLS LAST
    LIMIT $1
  `;
  const res = await db.query(query, [limit]);
  return res.rows;
};
