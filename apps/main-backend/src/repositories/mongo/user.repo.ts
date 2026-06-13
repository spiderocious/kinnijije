import type { User, UserPrefs, CursorPage } from '@kinnijije/core';

import { UserModel } from '../../db/models/user.model.js';
import type { CreateUserInput, UserRepo, UserWithSecret } from '../ports.js';
import { buildPage, clampLimit, decodeCursor } from './cursor.js';
import { mapUser } from './mappers.js';

export class MongoUserRepo implements UserRepo {
  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create({
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? 'user',
    });
    return mapUser(doc.toObject());
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? mapUser(doc) : null;
  }

  async findByEmail(email: string): Promise<UserWithSecret | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return { ...mapUser(doc), passwordHash: String(doc.passwordHash) };
  }

  async updatePrefs(id: string, prefs: Partial<UserPrefs>): Promise<User | null> {
    const set: Record<string, unknown> = {};
    if (prefs.cuisines !== undefined) set['prefs.cuisines'] = prefs.cuisines;
    if (prefs.difficultyFloor !== undefined) set['prefs.difficultyFloor'] = prefs.difficultyFloor;
    if (prefs.measurement !== undefined) set['prefs.measurement'] = prefs.measurement;
    const doc = await UserModel.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
    return doc ? mapUser(doc) : null;
  }

  async setStatus(id: string, status: 'active' | 'suspended'): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    return doc ? mapUser(doc) : null;
  }

  async setRole(id: string, role: 'user' | 'admin'): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { $set: { role } }, { new: true }).lean();
    return doc ? mapUser(doc) : null;
  }

  async pushRecentIngredients(id: string, keys: string[], cap = 30): Promise<void> {
    if (keys.length === 0) return;
    // Prepend new keys, de-dupe via $each + later $slice, keep most-recent-first.
    await UserModel.updateOne(
      { _id: id },
      { $pull: { recentIngredients: { $in: keys } } },
    );
    await UserModel.updateOne(
      { _id: id },
      { $push: { recentIngredients: { $each: keys, $position: 0, $slice: cap } } },
    );
  }

  async getRecentIngredients(id: string): Promise<string[]> {
    const doc = await UserModel.findById(id).select('recentIngredients').lean();
    return doc?.recentIngredients?.map((k) => String(k)) ?? [];
  }

  async delete(id: string): Promise<void> {
    await UserModel.deleteOne({ _id: id });
  }

  async list(params: { cursor?: string; limit?: number; q?: string }): Promise<CursorPage<User>> {
    const limit = clampLimit(params.limit);
    const filter: Record<string, unknown> = {};
    if (params.cursor) {
      const id = decodeCursor(params.cursor);
      if (id) filter['_id'] = { $lt: id };
    }
    if (params.q) {
      filter['$or'] = [
        { email: { $regex: params.q, $options: 'i' } },
        { name: { $regex: params.q, $options: 'i' } },
      ];
    }
    const rows = await UserModel.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const page = buildPage(rows, limit, (r) => String(r._id));
    return { items: page.items.map(mapUser), nextCursor: page.nextCursor, hasMore: page.hasMore };
  }

  async count(): Promise<number> {
    return UserModel.estimatedDocumentCount();
  }
}
