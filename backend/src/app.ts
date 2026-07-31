import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import deviceRoutes from './routes/deviceRoutes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://peaceful-warmth-production-4825.up.railway.app'
}));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  // In a real health check we would verify DB & Redis connection status.
  // For now return 200 OK.
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/device', deviceRoutes);

export default app;
