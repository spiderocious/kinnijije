// Shared domain types. These are inferred from the Zod schemas in
// `../domain/*` so the schema is the single source of truth and the type can
// never drift from validation. Import the schema when you need to parse; import
// the type when you only need the shape.

export type {
  UserRole,
  UserStatus,
  Difficulty,
  DifficultyFloor,
  MeasurementSystem,
  CuisineBias,
  UserPrefs,
  User,
} from '../domain/user.js';

export type {
  RecipeSource,
  RecipeStatus,
  HeroImageKind,
  RecipeIngredient,
  RecipeStep,
  Recipe,
} from '../domain/recipe.js';

export type { SuggestionMatch, SuggestionCard } from '../domain/suggestion.js';

export type { Favourite } from '../domain/favourite.js';

export type { FeedbackTargetKind, FeedbackTarget, FeedbackStatus, Feedback } from '../domain/feedback.js';

export type { ExtractionKind, Extraction } from '../domain/extraction.js';

export type { AiCallKind, AiProviderName, AiCallStatus, AiAudit } from '../domain/ai-audit.js';

export type { PromptKey, Prompt } from '../domain/prompt.js';

export type { FeatureFlag, FeatureFlagKey } from '../domain/feature-flag.js';

export type { CursorPage, Tokens, AuthResult } from '../domain/common.js';
