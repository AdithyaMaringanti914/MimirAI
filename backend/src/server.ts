import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { logger } from './utils/logger';
import { setupSocketServer } from './socket';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://peaceful-warmth-production-4825.up.railway.app',
    methods: ['GET', 'POST']
  }
});

setupSocketServer(io);

server.listen(PORT, () => {
  logger.info(`Mimir Backend running on port ${PORT}`);
});
