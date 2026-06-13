import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { param } from '@lib/http/params.js';
import { ConflictError, NotFoundError } from '@lib/errors.js';
import { ResponseUtil } from '@lib/response.js';
import { authUserId, requireAuth } from '@middlewares/auth.middleware.js';

import { repos } from '../../repositories/index.js';
import { presentRecipe } from '../recipes/recipe.presenter.js';
import { CreateFavouriteBody } from './favourites.schema.js';

const router: IRouter = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = authUserId(req);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const page = await repos.favourites.list({ userId, ...(cursor !== undefined ? { cursor } : {}) });
    return ResponseUtil.ok(res, page);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = authUserId(req);
    const body = CreateFavouriteBody.parse(req.body);

    const recipe = await repos.recipes.findById(body.recipeId);
    if (!recipe) throw new NotFoundError('Recipe');

    if (await repos.favourites.exists(userId, body.recipeId)) {
      throw new ConflictError('Recipe already in favourites');
    }

    // Freeze the presented recipe (AI times already padded) as the snapshot.
    const favourite = await repos.favourites.create({
      userId,
      recipeId: body.recipeId,
      snapshot: presentRecipe(recipe),
    });
    return ResponseUtil.created(res, { favourite });
  }),
);

router.delete(
  '/:recipeId',
  asyncHandler(async (req, res) => {
    await repos.favourites.delete(authUserId(req), param(req, 'recipeId'));
    return ResponseUtil.noContent(res);
  }),
);

export default router;
