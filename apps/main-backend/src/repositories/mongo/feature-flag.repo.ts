import type { FeatureFlag } from '@kinnijije/core';

import { FeatureFlagModel } from '../../db/models/feature-flag.model.js';
import type { FeatureFlagRepo } from '../ports.js';
import { mapFeatureFlag } from './mappers.js';

export class MongoFeatureFlagRepo implements FeatureFlagRepo {
  async get(key: string): Promise<FeatureFlag | null> {
    const doc = await FeatureFlagModel.findOne({ key }).lean();
    return doc ? mapFeatureFlag(doc) : null;
  }

  async isEnabled(key: string, fallback = true): Promise<boolean> {
    const doc = await FeatureFlagModel.findOne({ key }).lean();
    return doc ? Boolean(doc.enabled) : fallback;
  }

  async listAll(): Promise<FeatureFlag[]> {
    const rows = await FeatureFlagModel.find().sort({ key: 1 }).lean();
    return rows.map(mapFeatureFlag);
  }

  async set(key: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlag | null> {
    const doc = await FeatureFlagModel.findOneAndUpdate(
      { key },
      { $set: { enabled, ...(updatedBy !== undefined ? { updatedBy } : {}) } },
      { new: true },
    ).lean();
    return doc ? mapFeatureFlag(doc) : null;
  }

  async upsert(input: { key: string; enabled: boolean; description: string }): Promise<FeatureFlag> {
    const doc = await FeatureFlagModel.findOneAndUpdate(
      { key: input.key },
      { $setOnInsert: { enabled: input.enabled, description: input.description } },
      { new: true, upsert: true },
    ).lean();
    return mapFeatureFlag(doc as Record<string, unknown>);
  }
}
