import type { Prompt, PromptKey } from '@kinnijije/core';

import { PromptModel } from '../../db/models/prompt.model.js';
import type { PromptRepo } from '../ports.js';
import { mapPrompt } from './mappers.js';

export class MongoPromptRepo implements PromptRepo {
  async getActive(key: PromptKey): Promise<Prompt | null> {
    const doc = await PromptModel.findOne({ key, active: true }).lean();
    return doc ? mapPrompt(doc) : null;
  }

  async listAll(): Promise<Prompt[]> {
    const rows = await PromptModel.find().sort({ key: 1, version: -1 }).lean();
    return rows.map(mapPrompt);
  }

  async listForKey(key: PromptKey): Promise<Prompt[]> {
    const rows = await PromptModel.find({ key }).sort({ version: -1 }).lean();
    return rows.map(mapPrompt);
  }

  async createVersion(input: {
    key: PromptKey;
    template: string;
    notes?: string;
    createdBy?: string;
  }): Promise<Prompt> {
    const latest = await PromptModel.findOne({ key: input.key }).sort({ version: -1 }).lean();
    const nextVersion = (latest?.version ?? 0) + 1;
    // Deactivate previous active version, then insert the new active one.
    await PromptModel.updateMany({ key: input.key, active: true }, { $set: { active: false } });
    const doc = await PromptModel.create({
      key: input.key,
      version: nextVersion,
      template: input.template,
      active: true,
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.createdBy !== undefined ? { createdBy: input.createdBy } : {}),
    });
    return mapPrompt(doc.toObject());
  }
}
