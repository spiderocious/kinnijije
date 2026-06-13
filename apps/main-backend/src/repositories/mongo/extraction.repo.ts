import type { Extraction, CursorPage } from '@kinnijije/core';

import { ExtractionModel } from '../../db/models/extraction.model.js';
import { heroProxyUrl } from '../../lib/file-service.js';
import type { ExtractionRepo } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapExtraction } from './mappers.js';

const toExtraction = (doc: Record<string, unknown>): Extraction => mapExtraction(doc, heroProxyUrl);

export class MongoExtractionRepo implements ExtractionRepo {
  async create(input: {
    userId: string;
    kind: 'photo' | 'voice';
    inputKeys: string[];
    transcript?: string;
    extractedIngredients: string[];
    aiAuditId?: string;
  }): Promise<{ id: string }> {
    const doc = await ExtractionModel.create({
      userId: input.userId,
      kind: input.kind,
      inputKeys: input.inputKeys,
      extractedIngredients: input.extractedIngredients,
      ...(input.transcript !== undefined ? { transcript: input.transcript } : {}),
      ...(input.aiAuditId !== undefined ? { aiAuditId: input.aiAuditId } : {}),
    });
    return { id: String(doc._id) };
  }

  async listForUser(params: {
    userId: string;
    cursor?: string;
    limit?: number;
  }): Promise<CursorPage<Extraction>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = { userId: params.userId };
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    const rows = await ExtractionModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return {
      items: page.items.map(toExtraction),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    };
  }
}
