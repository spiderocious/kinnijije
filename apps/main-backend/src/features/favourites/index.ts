import type { Express } from 'express';

import favouritesRoutes from './favourites.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/favourites', favouritesRoutes);
};
