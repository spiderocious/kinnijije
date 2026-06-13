import type { Express } from 'express';

import suggestionsRoutes from './suggestions.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/suggestions', suggestionsRoutes);
};
