import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import * as repo from '../database/deviceRepo';

export const registerDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, deviceName, platform, architecture, osVersion, passwordHash } = req.body;
    
    // We expect the frontend to send the plaintext password in this request in Phase 1 
    // to keep it simple, but let's hash it properly before storing.
    // If the frontend sends the hash already, we'll double hash it, which is fine for Phase 1.
    const salt = await bcrypt.genSalt(10);
    const dbHash = await bcrypt.hash(passwordHash, salt);

    const device = await repo.upsertDevice({
      deviceId,
      deviceName,
      platform,
      architecture,
      osVersion,
      passwordHash: dbHash,
      publicIp: req.ip
    });

    logger.info(`Device registered: ${deviceId}`);
    res.status(200).json({ success: true, device });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const heartbeat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, connectionQuality } = req.body;
    await repo.recordHeartbeat(deviceId, req.ip, connectionQuality);
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const rotatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, newHash } = req.body;
    const salt = await bcrypt.genSalt(10);
    const dbHash = await bcrypt.hash(newHash, salt);
    
    await repo.updatePassword(deviceId, dbHash);
    logger.info(`Password rotated for device: ${deviceId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(err);
    if (err instanceof Error && err.message === 'Device not found') {
      res.status(404).json({ error: 'Device not found' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const getDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.params;
    const device = await repo.getDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.status(200).json(device);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRecentDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await repo.getRecentDevices();
    res.status(200).json(devices);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
