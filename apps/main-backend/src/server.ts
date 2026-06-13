import { createServer, type Server } from 'node:http';

import { logger } from '@lib/logger.js';

import { buildApp } from './app.js';
import { bootstrapEnvChecks } from './env.runtime.js';
import { connectDb, disconnectDb } from './db/connection.js';
import { seedDefaults } from './bootstrap.js';
import { env } from './env.js';

const start = async (): Promise<Server> => {
  bootstrapEnvChecks();
  await connectDb(env.MONGODB_URI);
  await seedDefaults();

  const app = buildApp();
  const server = createServer(app);
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'main-backend listening');
  });
  return server;
};

const serverPromise = start().catch((err) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'shutting down gracefully');
  const server = await serverPromise;
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectDb();
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
