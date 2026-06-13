// Routing
export { ROUTES } from './constants/routes.js';

// Auth / token storage
export { createTokenStorage, TOKEN_KEYS } from './auth/token-storage.js';
export type { TokenStorage } from './auth/token-storage.js';

// Domain types (inferred from the Zod schemas)
export * from './types/index.js';

// Domain schemas + constants (runtime Zod objects, for validation + defaults)
export {
  UserRoleSchema,
  UserStatusSchema,
  DifficultySchema,
  DifficultyFloorSchema,
  MeasurementSystemSchema,
  UserPrefsSchema,
  UserSchema,
  DEFAULT_PREFS,
} from './domain/user.js';
export {
  RecipeSourceSchema,
  RecipeStatusSchema,
  HeroImageKindSchema,
  RecipeIngredientSchema,
  RecipeStepSchema,
  RecipeSchema,
} from './domain/recipe.js';
export { SuggestionMatchSchema, SuggestionCardSchema } from './domain/suggestion.js';
export { FavouriteSchema } from './domain/favourite.js';
export {
  FeedbackTargetKindSchema,
  FeedbackTargetSchema,
  FeedbackStatusSchema,
  FeedbackSchema,
} from './domain/feedback.js';
export { ExtractionKindSchema, ExtractionSchema } from './domain/extraction.js';
export {
  AiCallKindSchema,
  AiProviderNameSchema,
  AiCallStatusSchema,
  AiAuditSchema,
} from './domain/ai-audit.js';
export { PromptKeySchema, PromptSchema } from './domain/prompt.js';
export { FeatureFlagKeySchema, FeatureFlagSchema, FEATURE_FLAG_KEYS } from './domain/feature-flag.js';
export { TokensSchema } from './domain/common.js';

// Ingredient canonicalisation + dictionary (the suggestion-engine spine)
export {
  canonicaliseIngredient,
  canonicaliseList,
  allCanonicalKeys,
  suggestIngredients,
} from './ingredients/canonicalise.js';
export { INGREDIENT_ALIASES } from './ingredients/dictionary.js';

// Helpers
export { formatRelative } from './time/format-relative.js';
export { idempotencyKey } from './ids/idempotency-key.js';
