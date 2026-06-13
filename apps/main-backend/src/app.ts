import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { register as registerAdmin } from '@features/admin/index.js';
import { register as registerAuth } from '@features/auth/index.js';
import { register as registerFavourites } from '@features/favourites/index.js';
import { register as registerFeedback } from '@features/feedback/index.js';
import { register as registerHealth } from '@features/health/index.js';
import { register as registerIngredients } from '@features/ingredients/index.js';
import { register as registerMe } from '@features/me/index.js';
import { register as registerRecipes } from '@features/recipes/index.js';
import { register as registerSuggestions } from '@features/suggestions/index.js';
import { errorHandler } from '@middlewares/errorHandler.middleware.js';
import { requestIdMiddleware } from '@middlewares/requestId.middleware.js';
import { requestLogMiddleware } from '@middlewares/requestLog.middleware.js';

import { env } from './env.js';

// Registration order matters: specific paths before parameterised ones, and
// broad router mounts before narrower siblings under the same prefix. Admin and
// auth are mounted before the consumer feature routers; `me` carries the
// /api/v1/me + /api/v1/auth account routes.
const features = [
  registerHealth,
  registerAuth,
  registerMe,
  registerIngredients,
  registerSuggestions,
  registerRecipes,
  registerFavourites,
  registerFeedback,
  registerAdmin,
];

export const buildApp = (): express.Express => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_BASE_URL === '*' ? true : env.WEB_BASE_URL,
      credentials: true,
    }),
  );

  app.use(requestIdMiddleware);
  app.use(requestLogMiddleware);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(compression());

  features.forEach((register) => register(app));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
};
