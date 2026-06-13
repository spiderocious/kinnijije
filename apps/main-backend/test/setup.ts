import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Env must be set BEFORE any module that imports ../src/env.ts is loaded. This
// file is a setupFile, which Vitest evaluates before the test modules.
process.env['NODE_ENV'] = 'test';
process.env['AI_PROVIDER'] = 'mock';
process.env['APP_BASE_URL'] = 'http://localhost:8081';
process.env['WEB_BASE_URL'] = 'http://localhost:5173';
process.env['JWT_ACCESS_SECRET'] = 'test_access_secret_at_least_32_chars_long_xx';
process.env['JWT_REFRESH_SECRET'] = 'test_refresh_secret_at_least_32_chars_long_x';
process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_EXPIRES_IN'] = '30d';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Truncate every collection between tests (fast, keeps indexes) rather than
// dropping/recreating the container.
afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
