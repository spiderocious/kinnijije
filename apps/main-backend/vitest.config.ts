import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

// Vitest resolves the NodeNext `.js` import specifiers + the @lib/@features/etc
// aliases via esbuild, so tests import the TS sources directly. The setup file
// spins up an in-memory Mongo and connects Mongoose before each suite.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@lib\/(.*)\.js$/, replacement: resolve(__dirname, 'src/lib/$1.ts') },
      { find: /^@middlewares\/(.*)\.js$/, replacement: resolve(__dirname, 'src/middlewares/$1.ts') },
      { find: /^@features\/(.*)\.js$/, replacement: resolve(__dirname, 'src/features/$1.ts') },
      { find: /^@shared\/(.*)\.js$/, replacement: resolve(__dirname, 'src/shared/$1.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    fileParallelism: false, // shared in-memory Mongo; run suites serially
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
