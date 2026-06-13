import type { Recipe, RecipeSource, RecipeStatus, CursorPage } from '@kinnijije/core';

import { RecipeModel } from '../../db/models/recipe.model.js';
import { heroProxyUrl } from '../../lib/file-service.js';
import type { CreateRecipeInput, RecipeRepo } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapRecipe } from './mappers.js';

const toRecipe = (doc: Record<string, unknown>): Recipe => mapRecipe(doc, heroProxyUrl);

export class MongoRecipeRepo implements RecipeRepo {
  async create(input: CreateRecipeInput): Promise<Recipe> {
    const doc = await RecipeModel.create({
      slug: input.slug,
      source: input.source,
      status: input.status ?? 'draft',
      name: input.name,
      cuisines: input.cuisines,
      difficulty: input.difficulty,
      cookTimeMinutes: input.cookTimeMinutes,
      serves: input.serves,
      ingredients: input.ingredients,
      steps: input.steps,
      searchKeys: input.searchKeys,
      heroImageKey: input.heroImageKey ?? null,
      heroImageKind: input.heroImageKind ?? 'placeholder',
      createdBy: input.createdBy ?? null,
      sourceAuditId: input.sourceAuditId ?? null,
    });
    return toRecipe(doc.toObject());
  }

  async findById(id: string): Promise<Recipe | null> {
    const doc = await RecipeModel.findById(id).lean();
    return doc ? toRecipe(doc) : null;
  }

  async update(id: string, patch: Partial<CreateRecipeInput>): Promise<Recipe | null> {
    const doc = await RecipeModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    return doc ? toRecipe(doc) : null;
  }

  async setStatus(id: string, status: RecipeStatus): Promise<Recipe | null> {
    const doc = await RecipeModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    return doc ? toRecipe(doc) : null;
  }

  async setHero(id: string, key: string, kind: 'photo' | 'generated'): Promise<Recipe | null> {
    const doc = await RecipeModel.findByIdAndUpdate(
      id,
      { $set: { heroImageKey: key, heroImageKind: kind } },
      { new: true },
    ).lean();
    return doc ? toRecipe(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await RecipeModel.deleteOne({ _id: id });
  }

  async list(params: {
    cursor?: string;
    limit?: number;
    status?: RecipeStatus;
    source?: RecipeSource;
  }): Promise<CursorPage<Recipe>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = {};
    if (params.status) filter['status'] = params.status;
    if (params.source) filter['source'] = params.source;
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    const rows = await RecipeModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return { items: page.items.map(toRecipe), nextCursor: page.nextCursor, hasMore: page.hasMore };
  }

  async findPublishedMatching(searchKeys: string[], limit: number): Promise<Recipe[]> {
    if (searchKeys.length === 0) return [];
    const rows = await RecipeModel.find({
      status: 'published',
      searchKeys: { $in: searchKeys },
    })
      .limit(limit)
      .lean();
    return rows.map(toRecipe);
  }

  async countByStatus(status: RecipeStatus): Promise<number> {
    return RecipeModel.countDocuments({ status });
  }
}
