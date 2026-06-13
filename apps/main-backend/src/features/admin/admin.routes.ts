import { Router, type IRouter } from 'express';

import { PromptKeySchema } from '@kinnijije/core';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { param } from '@lib/http/params.js';
import { NotFoundError, ValidationError } from '@lib/errors.js';
import { authUserId, requireAdmin, requireAuth } from '@middlewares/auth.middleware.js';
import { ResponseUtil } from '@lib/response.js';

import { repos } from '../../repositories/index.js';
import { createRecipe, generateToDraft, updateRecipe } from './admin-recipes.service.js';
import {
  CreateRecipeBody,
  GenerateRecipeBody,
  SetFlagBody,
  SetHeroBody,
  UpdateFeedbackBody,
  UpdateRecipeBody,
  UpdateUserBody,
  UpsertPromptBody,
} from './admin.schema.js';

const router: IRouter = Router();

// Every admin route requires an authenticated admin.
router.use(requireAuth, requireAdmin);

const cursorOf = (q: unknown): string | undefined => (typeof q === 'string' ? q : undefined);

// ---- Metrics -------------------------------------------------------------

router.get(
  '/metrics',
  asyncHandler(async (_req, res) => {
    const [users, publishedRecipes, draftRecipes, aiCalls, aiCostUsd] = await Promise.all([
      repos.users.count(),
      repos.recipes.countByStatus('published'),
      repos.recipes.countByStatus('draft'),
      repos.aiAudit.count(),
      repos.aiAudit.totalCostUsd(),
    ]);
    return ResponseUtil.ok(res, {
      users,
      recipes: { published: publishedRecipes, draft: draftRecipes },
      ai: { calls: aiCalls, costUsd: aiCostUsd },
    });
  }),
);

// ---- Users ---------------------------------------------------------------

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const page = await repos.users.list({
      ...(cursorOf(req.query.cursor) !== undefined ? { cursor: cursorOf(req.query.cursor) } : {}),
      ...(typeof req.query.q === 'string' ? { q: req.query.q } : {}),
    });
    return ResponseUtil.ok(res, page);
  }),
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await repos.users.findById(param(req, 'id'));
    if (!user) throw new NotFoundError('User');
    const [favourites, extractions] = await Promise.all([
      repos.favourites.list({ userId: user.id, limit: 10 }),
      repos.extractions.listForUser({ userId: user.id, limit: 10 }),
    ]);
    return ResponseUtil.ok(res, { user, favourites: favourites.items, extractions: extractions.items });
  }),
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const body = UpdateUserBody.parse(req.body);
    let user = await repos.users.findById(param(req, 'id'));
    if (!user) throw new NotFoundError('User');
    if (body.status !== undefined) user = (await repos.users.setStatus(param(req, 'id'), body.status)) ?? user;
    if (body.role !== undefined) user = (await repos.users.setRole(param(req, 'id'), body.role)) ?? user;
    return ResponseUtil.ok(res, { user });
  }),
);

// ---- Recipes -------------------------------------------------------------

router.get(
  '/recipes',
  asyncHandler(async (req, res) => {
    const status = req.query.status === 'draft' || req.query.status === 'published' ? req.query.status : undefined;
    const source = req.query.source === 'seed' || req.query.source === 'ai' ? req.query.source : undefined;
    const page = await repos.recipes.list({
      ...(cursorOf(req.query.cursor) !== undefined ? { cursor: cursorOf(req.query.cursor) } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(source !== undefined ? { source } : {}),
    });
    return ResponseUtil.ok(res, page);
  }),
);

router.post(
  '/recipes',
  asyncHandler(async (req, res) => {
    const body = CreateRecipeBody.parse(req.body);
    const recipe = await createRecipe(body, authUserId(req));
    return ResponseUtil.created(res, { recipe });
  }),
);

// Specific /recipes/generate must be registered before /recipes/:id.
router.post(
  '/recipes/generate',
  asyncHandler(async (req, res) => {
    const body = GenerateRecipeBody.parse(req.body);
    const recipe = await generateToDraft(body, authUserId(req));
    return ResponseUtil.created(res, { recipe });
  }),
);

router.patch(
  '/recipes/:id',
  asyncHandler(async (req, res) => {
    const body = UpdateRecipeBody.parse(req.body);
    const recipe = await updateRecipe(param(req, 'id'), body);
    return ResponseUtil.ok(res, { recipe });
  }),
);

router.post(
  '/recipes/:id/publish',
  asyncHandler(async (req, res) => {
    const recipe = await repos.recipes.setStatus(param(req, 'id'), 'published');
    if (!recipe) throw new NotFoundError('Recipe');
    return ResponseUtil.ok(res, { recipe });
  }),
);

router.post(
  '/recipes/:id/unpublish',
  asyncHandler(async (req, res) => {
    const recipe = await repos.recipes.setStatus(param(req, 'id'), 'draft');
    if (!recipe) throw new NotFoundError('Recipe');
    return ResponseUtil.ok(res, { recipe });
  }),
);

router.post(
  '/recipes/:id/hero',
  asyncHandler(async (req, res) => {
    const body = SetHeroBody.parse(req.body);
    const recipe = await repos.recipes.setHero(param(req, 'id'), body.key, body.kind);
    if (!recipe) throw new NotFoundError('Recipe');
    return ResponseUtil.ok(res, { recipe });
  }),
);

router.delete(
  '/recipes/:id',
  asyncHandler(async (req, res) => {
    await repos.recipes.delete(param(req, 'id'));
    return ResponseUtil.noContent(res);
  }),
);

// ---- AI audit trail ------------------------------------------------------

router.get(
  '/ai-audit',
  asyncHandler(async (req, res) => {
    const kind = ['vision', 'whisper', 'parse', 'generate'].includes(String(req.query.kind))
      ? (req.query.kind as 'vision' | 'whisper' | 'parse' | 'generate')
      : undefined;
    const status = req.query.status === 'ok' || req.query.status === 'error' ? req.query.status : undefined;
    const page = await repos.aiAudit.list({
      ...(cursorOf(req.query.cursor) !== undefined ? { cursor: cursorOf(req.query.cursor) } : {}),
      ...(kind !== undefined ? { kind } : {}),
      ...(status !== undefined ? { status } : {}),
    });
    return ResponseUtil.ok(res, page);
  }),
);

router.get(
  '/ai-audit/:id',
  asyncHandler(async (req, res) => {
    const entry = await repos.aiAudit.findById(param(req, 'id'));
    if (!entry) throw new NotFoundError('AI audit entry');
    return ResponseUtil.ok(res, { entry });
  }),
);

// ---- Prompts -------------------------------------------------------------

router.get(
  '/prompts',
  asyncHandler(async (_req, res) => {
    const prompts = await repos.prompts.listAll();
    return ResponseUtil.ok(res, { prompts });
  }),
);

router.get(
  '/prompts/:key',
  asyncHandler(async (req, res) => {
    const parsed = PromptKeySchema.safeParse(param(req, 'key'));
    if (!parsed.success) throw new ValidationError('Invalid prompt key', { key: ['unknown prompt key'] });
    const versions = await repos.prompts.listForKey(parsed.data);
    return ResponseUtil.ok(res, { versions });
  }),
);

router.put(
  '/prompts/:key',
  asyncHandler(async (req, res) => {
    const parsed = PromptKeySchema.safeParse(param(req, 'key'));
    if (!parsed.success) throw new ValidationError('Invalid prompt key', { key: ['unknown prompt key'] });
    const body = UpsertPromptBody.parse(req.body);
    const prompt = await repos.prompts.createVersion({
      key: parsed.data,
      template: body.template,
      createdBy: authUserId(req),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    });
    return ResponseUtil.created(res, { prompt });
  }),
);

// ---- Feature flags -------------------------------------------------------

router.get(
  '/feature-flags',
  asyncHandler(async (_req, res) => {
    const flags = await repos.featureFlags.listAll();
    return ResponseUtil.ok(res, { flags });
  }),
);

router.patch(
  '/feature-flags/:key',
  asyncHandler(async (req, res) => {
    const body = SetFlagBody.parse(req.body);
    const flag = await repos.featureFlags.set(param(req, 'key'), body.enabled, authUserId(req));
    if (!flag) throw new NotFoundError('Feature flag');
    return ResponseUtil.ok(res, { flag });
  }),
);

// ---- Feedback review -----------------------------------------------------

router.get(
  '/feedback',
  asyncHandler(async (req, res) => {
    const status = req.query.status === 'open' || req.query.status === 'reviewed' ? req.query.status : undefined;
    const page = await repos.feedback.list({
      ...(cursorOf(req.query.cursor) !== undefined ? { cursor: cursorOf(req.query.cursor) } : {}),
      ...(status !== undefined ? { status } : {}),
    });
    return ResponseUtil.ok(res, page);
  }),
);

router.patch(
  '/feedback/:id',
  asyncHandler(async (req, res) => {
    const body = UpdateFeedbackBody.parse(req.body);
    const feedback = await repos.feedback.setStatus(param(req, 'id'), body.status);
    if (!feedback) throw new NotFoundError('Feedback');
    return ResponseUtil.ok(res, { feedback });
  }),
);

export default router;
