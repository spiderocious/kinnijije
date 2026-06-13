import type { Express } from 'express';

import feedbackRoutes from './feedback.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/feedback', feedbackRoutes);
};
