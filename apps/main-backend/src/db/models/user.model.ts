import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const prefsSchema = new Schema(
  {
    cuisines: { type: [String], default: ['Nigerian', 'West African'] },
    difficultyFloor: {
      type: String,
      enum: ['easy', 'medium', 'anything'],
      default: 'anything',
    },
    measurement: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
    prefs: { type: prefsSchema, default: () => ({}) },
    recentIngredients: { type: [String], default: [] },
  },
  { timestamps: true, strict: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export type UserHydrated = HydratedDocument<UserDoc>;

export const UserModel = model('User', userSchema);
