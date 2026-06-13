import mongoose from 'mongoose';

import { logger } from '@lib/logger.js';

// Connection lifecycle is owned here, not in app.ts — so tests can point
// Mongoose at an in-memory server (mongodb-memory-server) and mount buildApp()
// without a real database. server.ts calls connectDb() at boot.

export async function connectDb(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('Mongo connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
