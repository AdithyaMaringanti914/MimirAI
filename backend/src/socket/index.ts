import { Server, Socket } from 'socket.io';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const setupSocketServer = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('device:register', async (data) => {
      try {
        const { deviceId } = data; // In production verify JWT here
        if (!deviceId) return;

        // Map socket to device
        await redisClient.set(`socket:${socket.id}`, deviceId);
        await redisClient.set(`device:${deviceId}`, socket.id);
        
        logger.info(`Device ${deviceId} registered on socket ${socket.id}`);
        socket.emit('device:registered', { success: true });
      } catch (err) {
        logger.error(err);
      }
    });

    // Handle generic signaling relay
    const relayEvent = async (eventName: string, data: any) => {
      try {
        const { targetId, ...payload } = data;
        const targetSocketId = await redisClient.get(`device:${targetId}`);
        
        if (!targetSocketId) {
          socket.emit('DEVICE_NOT_FOUND', { targetId });
          return;
        }

        // Add source device ID to the payload
        const sourceId = await redisClient.get(`socket:${socket.id}`);
        io.to(targetSocketId).emit(eventName, { sourceId, ...payload });
      } catch (err) {
        logger.error(err);
      }
    };

    socket.on('device:offer', (data) => relayEvent('device:offer', data));
    socket.on('device:answer', (data) => relayEvent('device:answer', data));
    socket.on('device:ice', (data) => relayEvent('device:ice', data));
    
    // Connection approval flows
    socket.on('device:request', (data) => relayEvent('device:request', data));
    socket.on('device:cancel', (data) => relayEvent('device:cancel', data));
    socket.on('device:approval', (data) => relayEvent('device:approval', data));
    socket.on('device:reject', (data) => relayEvent('device:reject', data));

    // Relay commands to Native Agent namespace
    socket.on('agent:command', async (data) => {
      try {
        const { targetId, packet } = data;
        // In a real implementation, we'd lookup the specific agent's socket ID in redis.
        // For this phase, we'll broadcast to the agent namespace (or target if mapped).
        agentNamespace.emit('agent:command', packet);
      } catch (err) {
        logger.error(err);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const deviceId = await redisClient.get(`socket:${socket.id}`);
        if (deviceId) {
          await redisClient.del(`device:${deviceId}`);
          await redisClient.del(`socket:${socket.id}`);
          logger.info(`Device ${deviceId} disconnected`);
        }
      } catch (err) {
        logger.error(err);
      }
    });
  });

  // Native Agent Namespace
  const agentNamespace = io.of('/native-agent');
  agentNamespace.on('connection', (socket: Socket) => {
    logger.info(`Native Agent connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Native Agent disconnected: ${socket.id}`);
    });
  });
};
