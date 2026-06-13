import { RefreshTokenModel } from '../../db/models/refresh-token.model.js';
import type { RefreshTokenRepo } from '../ports.js';

export class MongoRefreshTokenRepo implements RefreshTokenRepo {
  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await RefreshTokenModel.create(input);
  }

  async findActiveByHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const doc = await RefreshTokenModel.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!doc) return null;
    return { id: String(doc._id), userId: String(doc.userId) };
  }

  async revoke(tokenHash: string): Promise<void> {
    await RefreshTokenModel.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }
}
