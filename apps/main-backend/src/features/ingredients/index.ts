import type { Express } from 'express';

import ingredientsRoutes from './ingredients.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/ingredients', ingredientsRoutes);
};
