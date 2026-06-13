import type { Express } from 'express';

import adminRoutes from './admin.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/admin', adminRoutes);
};
