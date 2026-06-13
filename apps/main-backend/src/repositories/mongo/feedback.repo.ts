import type { Feedback, FeedbackStatus, CursorPage } from '@kinnijije/core';

import { FeedbackModel } from '../../db/models/feedback.model.js';
import type { FeedbackRepo } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapFeedback } from './mappers.js';

export class MongoFeedbackRepo implements FeedbackRepo {
  async create(input: {
    userId: string;
    recipeId: string;
    target: Feedback['target'];
    note?: string;
  }): Promise<Feedback> {
    const doc = await FeedbackModel.create({
      userId: input.userId,
      recipeId: input.recipeId,
      target: input.target,
      ...(input.note !== undefined ? { note: input.note } : {}),
    });
    return mapFeedback(doc.toObject());
  }

  async setStatus(id: string, status: FeedbackStatus): Promise<Feedback | null> {
    const doc = await FeedbackModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    return doc ? mapFeedback(doc) : null;
  }

  async list(params: {
    cursor?: string;
    limit?: number;
    status?: FeedbackStatus;
  }): Promise<CursorPage<Feedback>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = {};
    if (params.status) filter['status'] = params.status;
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    const rows = await FeedbackModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return { items: page.items.map(mapFeedback), nextCursor: page.nextCursor, hasMore: page.hasMore };
  }
}
