// Repository ports — the interfaces the service layer depends on. Services never
// import a Mongoose model directly; they take a port. The Mongo adapters in
// ./mongo/* implement these. Swapping the database later = new adapters, no
// service changes.

import type {
  User,
  UserPrefs,
  Recipe,
  RecipeSource,
  RecipeStatus,
  Favourite,
  Feedback,
  FeedbackStatus,
  Extraction,
  AiAudit,
  AiCallKind,
  AiCallStatus,
  Prompt,
  PromptKey,
  FeatureFlag,
  CursorPage,
} from '@kinnijije/core';

// ---- Users ---------------------------------------------------------------

// The internal user shape carries the passwordHash (never leaves the repo +
// auth service). `User` (from core) is the public-safe projection.
export interface UserWithSecret extends User {
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface UserRepo {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<UserWithSecret | null>;
  updatePrefs(
    id: string,
    prefs: {
      cuisines?: string[] | undefined;
      difficultyFloor?: UserPrefs['difficultyFloor'] | undefined;
      measurement?: UserPrefs['measurement'] | undefined;
    },
  ): Promise<User | null>;
  setStatus(id: string, status: 'active' | 'suspended'): Promise<User | null>;
  setRole(id: string, role: 'user' | 'admin'): Promise<User | null>;
  pushRecentIngredients(id: string, keys: string[], cap?: number): Promise<void>;
  getRecentIngredients(id: string): Promise<string[]>;
  delete(id: string): Promise<void>;
  list(params: { cursor?: string | undefined; limit?: number | undefined; q?: string }): Promise<CursorPage<User>>;
  count(): Promise<number>;
}

// ---- Refresh tokens ------------------------------------------------------

export interface RefreshTokenRepo {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findActiveByHash(tokenHash: string): Promise<{ id: string; userId: string } | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

// ---- Recipes -------------------------------------------------------------

export interface CreateRecipeInput {
  slug: string;
  source: RecipeSource;
  status?: RecipeStatus | undefined;
  name: string;
  cuisines: string[];
  difficulty: 'easy' | 'medium' | 'involved';
  cookTimeMinutes: number;
  serves: number;
  ingredients: Recipe['ingredients'];
  steps: Recipe['steps'];
  searchKeys: string[];
  heroImageKey?: string | null;
  heroImageKind?: 'photo' | 'generated' | 'placeholder';
  createdBy?: string | null;
  sourceAuditId?: string | null;
}

export interface RecipeRepo {
  create(input: CreateRecipeInput): Promise<Recipe>;
  // Admin-facing: any recipe by id (incl. drafts). Returns null for an
  // unparseable id rather than throwing.
  findById(id: string): Promise<Recipe | null>;
  // Consumer-facing: only published recipes are visible. Drafts → null.
  findPublishedById(id: string): Promise<Recipe | null>;
  update(id: string, patch: Partial<CreateRecipeInput>): Promise<Recipe | null>;
  setStatus(id: string, status: RecipeStatus): Promise<Recipe | null>;
  setHero(id: string, key: string, kind: 'photo' | 'generated'): Promise<Recipe | null>;
  delete(id: string): Promise<void>;
  list(params: {
    cursor?: string | undefined;
    limit?: number | undefined;
    status?: RecipeStatus | undefined;
    source?: RecipeSource | undefined;
  }): Promise<CursorPage<Recipe>>;
  // Published recipes whose searchKeys overlap the supplied keys (suggestion
  // engine). Returns up to `limit`, richest overlap first is computed by the
  // service; the repo just narrows to candidates.
  findPublishedMatching(searchKeys: string[], limit: number): Promise<Recipe[]>;
  countByStatus(status: RecipeStatus): Promise<number>;
}

// ---- Favourites ----------------------------------------------------------

export interface FavouriteRepo {
  create(input: { userId: string; recipeId: string; snapshot: Recipe }): Promise<Favourite>;
  exists(userId: string, recipeId: string): Promise<boolean>;
  delete(userId: string, recipeId: string): Promise<void>;
  list(params: { userId: string; cursor?: string | undefined; limit?: number }): Promise<CursorPage<Favourite>>;
}

// ---- Feedback ------------------------------------------------------------

export interface FeedbackRepo {
  create(input: {
    userId: string;
    recipeId: string;
    target: Feedback['target'];
    note?: string;
  }): Promise<Feedback>;
  setStatus(id: string, status: FeedbackStatus): Promise<Feedback | null>;
  list(params: {
    cursor?: string | undefined;
    limit?: number | undefined;
    status?: FeedbackStatus | undefined;
  }): Promise<CursorPage<Feedback>>;
}

// ---- Extractions ---------------------------------------------------------

export interface ExtractionRepo {
  create(input: {
    userId: string;
    kind: 'photo' | 'voice';
    inputKeys: string[];
    transcript?: string;
    extractedIngredients: string[];
    aiAuditId?: string;
  }): Promise<{ id: string }>;
  listForUser(params: { userId: string; cursor?: string | undefined; limit?: number }): Promise<CursorPage<Extraction>>;
}

// ---- AI audit ------------------------------------------------------------

export interface CreateAiAuditInput {
  userId?: string;
  kind: AiCallKind;
  promptKey?: string;
  promptVersion?: number;
  provider: string;
  model: string;
  input: unknown;
  rawOutput: unknown;
  parsedOutput?: unknown;
  status: AiCallStatus;
  errorMessage?: string;
  latencyMs: number;
  costEstimateUsd: number;
}

export interface AiAuditRepo {
  create(input: CreateAiAuditInput): Promise<{ id: string }>;
  findById(id: string): Promise<AiAudit | null>;
  list(params: {
    cursor?: string | undefined;
    limit?: number | undefined;
    kind?: AiCallKind | undefined;
    status?: AiCallStatus | undefined;
  }): Promise<CursorPage<AiAudit>>;
  count(): Promise<number>;
  totalCostUsd(): Promise<number>;
}

// ---- Prompts -------------------------------------------------------------

export interface PromptRepo {
  getActive(key: PromptKey): Promise<Prompt | null>;
  listAll(): Promise<Prompt[]>;
  listForKey(key: PromptKey): Promise<Prompt[]>;
  createVersion(input: {
    key: PromptKey;
    template: string;
    notes?: string;
    createdBy?: string;
  }): Promise<Prompt>;
}

// ---- Feature flags -------------------------------------------------------

export interface FeatureFlagRepo {
  get(key: string): Promise<FeatureFlag | null>;
  isEnabled(key: string, fallback?: boolean): Promise<boolean>;
  listAll(): Promise<FeatureFlag[]>;
  set(key: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlag | null>;
  upsert(input: { key: string; enabled: boolean; description: string }): Promise<FeatureFlag>;
}
