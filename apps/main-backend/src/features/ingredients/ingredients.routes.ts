import { Router, type IRouter } from 'express';

import { suggestIngredients } from '@kinnijije/core';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { authUserId, requireAuth } from '@middlewares/auth.middleware.js';
import { requireFlag } from '@middlewares/featureFlag.middleware.js';

import { repos } from '../../repositories/index.js';
import { extractFromPhoto, extractFromVoice } from './ingredients.service.js';
import { ExtractPhotoBody, ExtractVoiceBody } from './ingredients.schema.js';

const router: IRouter = Router();

router.use(requireAuth);

// Autosuggest from the Nigerian-weighted dictionary (Type method).
router.get(
  '/suggest',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    return ResponseUtil.ok(res, { items: suggestIngredients(q) });
  }),
);

// "Or pick from recent" chips.
router.get(
  '/recent',
  asyncHandler(async (req, res) => {
    const items = await repos.users.getRecentIngredients(authUserId(req));
    return ResponseUtil.ok(res, { items });
  }),
);

router.post(
  '/extract/photo',
  requireFlag('input.photo'),
  asyncHandler(async (req, res) => {
    const body = ExtractPhotoBody.parse(req.body);
    const result = await extractFromPhoto({ userId: authUserId(req), keys: body.keys });
    return ResponseUtil.ok(res, result);
  }),
);

router.post(
  '/extract/voice',
  requireFlag('input.voice'),
  asyncHandler(async (req, res) => {
    const body = ExtractVoiceBody.parse(req.body);
    const result = await extractFromVoice({ userId: authUserId(req), key: body.key });
    return ResponseUtil.ok(res, result);
  }),
);

export default router;
