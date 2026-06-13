import type { Recipe, Favourite, CursorPage } from '@kinnijije/core';

import { FavouriteModel } from '../../db/models/favourite.model.js';
import type { FavouriteRepo } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapFavourite } from './mappers.js';

const toFav = (doc: Record<string, unknown>): Favourite => mapFavourite(doc);

export class MongoFavouriteRepo implements FavouriteRepo {
  async create(input: { userId: string; recipeId: string; snapshot: Recipe }): Promise<Favourite> {
    const doc = await FavouriteModel.create({
      userId: input.userId,
      recipeId: input.recipeId,
      savedSnapshot: input.snapshot,
    });
    return toFav(doc.toObject());
  }

  async exists(userId: string, recipeId: string): Promise<boolean> {
    const count = await FavouriteModel.countDocuments({ userId, recipeId });
    return count > 0;
  }

  async delete(userId: string, recipeId: string): Promise<void> {
    await FavouriteModel.deleteOne({ userId, recipeId });
  }

  async list(params: {
    userId: string;
    cursor?: string;
    limit?: number;
  }): Promise<CursorPage<Favourite>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = { userId: params.userId };
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    const rows = await FavouriteModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return { items: page.items.map(toFav), nextCursor: page.nextCursor, hasMore: page.hasMore };
  }
}
