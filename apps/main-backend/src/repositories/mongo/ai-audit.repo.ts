import type { AiAudit, AiCallKind, AiCallStatus, CursorPage } from '@kinnijije/core';

import { AiAuditModel } from '../../db/models/ai-audit.model.js';
import type { AiAuditRepo, CreateAiAuditInput } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapAiAudit } from './mappers.js';

export class MongoAiAuditRepo implements AiAuditRepo {
  async create(input: CreateAiAuditInput): Promise<{ id: string }> {
    const doc = await AiAuditModel.create({
      kind: input.kind,
      provider: input.provider,
      model: input.model,
      input: input.input,
      rawOutput: input.rawOutput,
      status: input.status,
      latencyMs: input.latencyMs,
      costEstimateUsd: input.costEstimateUsd,
      ...(input.userId !== undefined ? { userId: input.userId } : {}),
      ...(input.promptKey !== undefined ? { promptKey: input.promptKey } : {}),
      ...(input.promptVersion !== undefined ? { promptVersion: input.promptVersion } : {}),
      ...(input.parsedOutput !== undefined ? { parsedOutput: input.parsedOutput } : {}),
      ...(input.errorMessage !== undefined ? { errorMessage: input.errorMessage } : {}),
    });
    return { id: String(doc._id) };
  }

  async findById(id: string): Promise<AiAudit | null> {
    const doc = await AiAuditModel.findById(id).lean();
    return doc ? mapAiAudit(doc) : null;
  }

  async list(params: {
    cursor?: string;
    limit?: number;
    kind?: AiCallKind;
    status?: AiCallStatus;
  }): Promise<CursorPage<AiAudit>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = {};
    if (params.kind) filter['kind'] = params.kind;
    if (params.status) filter['status'] = params.status;
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    const rows = await AiAuditModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return { items: page.items.map(mapAiAudit), nextCursor: page.nextCursor, hasMore: page.hasMore };
  }

  async count(): Promise<number> {
    return AiAuditModel.estimatedDocumentCount();
  }

  async totalCostUsd(): Promise<number> {
    const res = await AiAuditModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: '$costEstimateUsd' } } },
    ]);
    return res[0]?.total ?? 0;
  }
}
