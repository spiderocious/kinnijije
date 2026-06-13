import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';

import * as authService from './auth.service.js';
import { LoginBody, RefreshBody, RegisterBody } from './auth.schema.js';

const router: IRouter = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = RegisterBody.parse(req.body);
    const result = await authService.register(body);
    return ResponseUtil.created(res, result);
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = LoginBody.parse(req.body);
    const result = await authService.login(body);
    return ResponseUtil.ok(res, result);
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const body = RefreshBody.parse(req.body);
    const tokens = await authService.refresh(body.refresh_token);
    return ResponseUtil.ok(res, tokens);
  }),
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const body = RefreshBody.parse(req.body);
    await authService.logout(body.refresh_token);
    return ResponseUtil.noContent(res);
  }),
);

export default router;
