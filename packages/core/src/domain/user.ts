import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'suspended']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

// Difficulty as used on a recipe.
export const DifficultySchema = z.enum(['easy', 'medium', 'involved']);
export type Difficulty = z.infer<typeof DifficultySchema>;

// The onboarding "how adventurous" answer — a floor, not the same scale as a
// recipe's difficulty (`anything` means no floor).
export const DifficultyFloorSchema = z.enum(['easy', 'medium', 'anything']);
export type DifficultyFloor = z.infer<typeof DifficultyFloorSchema>;

export const MeasurementSystemSchema = z.enum(['metric', 'imperial']);
export type MeasurementSystem = z.infer<typeof MeasurementSystemSchema>;

// Cuisine biases offered at onboarding. Free-form strings are allowed too (the
// admin can extend the set), but these are the curated defaults.
export const CuisineBiasSchema = z.string().min(1);
export type CuisineBias = z.infer<typeof CuisineBiasSchema>;

export const UserPrefsSchema = z.object({
  cuisines: z.array(CuisineBiasSchema),
  difficultyFloor: DifficultyFloorSchema,
  measurement: MeasurementSystemSchema,
});
export type UserPrefs = z.infer<typeof UserPrefsSchema>;

// The public-safe user shape (no passwordHash). This is the wire shape returned
// by /me and embedded in AuthResult.
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  prefs: UserPrefsSchema,
  createdAt: z.string(), // ISO 8601
});
export type User = z.infer<typeof UserSchema>;

export const DEFAULT_PREFS: UserPrefs = {
  cuisines: ['Nigerian', 'West African'],
  difficultyFloor: 'anything',
  measurement: 'metric',
};
