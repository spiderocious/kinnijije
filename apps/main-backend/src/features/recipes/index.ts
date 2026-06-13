import type { Express } from 'express';

import recipesRoutes from './recipes.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/recipes', recipesRoutes);
};
