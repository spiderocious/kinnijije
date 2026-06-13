import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { authUserId, requireAuth } from '@middlewares/auth.middleware.js';

import { suggest } from './suggestions.service.js';
import { SuggestBody } from './suggestions.schema.js';

const router: IRouter = Router();

router.use(requireAuth);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = SuggestBody.parse(req.body);
    const suggestions = await suggest({
      userId: authUserId(req),
      ingredients: body.ingredients,
      ...(body.excludeRecipeIds !== undefined ? { excludeRecipeIds: body.excludeRecipeIds } : {}),
    });
    return ResponseUtil.ok(res, { suggestions });
  }),
);

export default router;
