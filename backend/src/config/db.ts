import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://mimir_user:mimir_password@localhost:5432/mimir_db',
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};
