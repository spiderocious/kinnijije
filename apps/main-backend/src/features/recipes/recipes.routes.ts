import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { param } from '@lib/http/params.js';
import { NotFoundError } from '@lib/errors.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth } from '@middlewares/auth.middleware.js';

import { repos } from '../../repositories/index.js';
import { presentRecipe } from './recipe.presenter.js';

const router: IRouter = Router();

router.use(requireAuth);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const recipe = await repos.recipes.findById(param(req, 'id'));
    if (!recipe) throw new NotFoundError('Recipe');
    return ResponseUtil.ok(res, { recipe: presentRecipe(recipe) });
  }),
);

export default router;
