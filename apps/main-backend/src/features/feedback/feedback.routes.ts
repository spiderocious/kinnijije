import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { NotFoundError } from '@lib/errors.js';
import { ResponseUtil } from '@lib/response.js';
import { authUserId, requireAuth } from '@middlewares/auth.middleware.js';

import { repos } from '../../repositories/index.js';
import { CreateFeedbackBody } from './feedback.schema.js';

const router: IRouter = Router();

router.use(requireAuth);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = CreateFeedbackBody.parse(req.body);
    const recipe = await repos.recipes.findById(body.recipeId);
    if (!recipe) throw new NotFoundError('Recipe');

    const feedback = await repos.feedback.create({
      userId: authUserId(req),
      recipeId: body.recipeId,
      target: body.target,
      ...(body.note !== undefined ? { note: body.note } : {}),
    });
    return ResponseUtil.created(res, { feedback });
  }),
);

export default router;
