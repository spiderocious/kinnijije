import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { NotFoundError } from '@lib/errors.js';
import { ResponseUtil } from '@lib/response.js';
import { authUserId, requireAuth } from '@middlewares/auth.middleware.js';

import { repos } from '../../repositories/index.js';
import { UpdatePrefsBody } from './me.schema.js';

const router: IRouter = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await repos.users.findById(authUserId(req));
    if (!user) throw new NotFoundError('User');
    return ResponseUtil.ok(res, { user });
  }),
);

router.patch(
  '/prefs',
  asyncHandler(async (req, res) => {
    const body = UpdatePrefsBody.parse(req.body);
    const user = await repos.users.updatePrefs(authUserId(req), body);
    if (!user) throw new NotFoundError('User');
    return ResponseUtil.ok(res, { user });
  }),
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const userId = authUserId(req);
    await repos.refreshTokens.revokeAllForUser(userId);
    await repos.users.delete(userId);
    return ResponseUtil.noContent(res);
  }),
);

export default router;
