// Composition root for the data layer. Services and controllers import the
// `repos` singleton (the ports), never a Mongoose model. Swapping persistence =
// swap the impls here; nothing else changes.

import type {
  UserRepo,
  RefreshTokenRepo,
  RecipeRepo,
  FavouriteRepo,
  FeedbackRepo,
  ExtractionRepo,
  AiAuditRepo,
  PromptRepo,
  FeatureFlagRepo,
} from './ports.js';
import { MongoUserRepo } from './mongo/user.repo.js';
import { MongoRefreshTokenRepo } from './mongo/refresh-token.repo.js';
import { MongoRecipeRepo } from './mongo/recipe.repo.js';
import { MongoFavouriteRepo } from './mongo/favourite.repo.js';
import { MongoFeedbackRepo } from './mongo/feedback.repo.js';
import { MongoExtractionRepo } from './mongo/extraction.repo.js';
import { MongoAiAuditRepo } from './mongo/ai-audit.repo.js';
import { MongoPromptRepo } from './mongo/prompt.repo.js';
import { MongoFeatureFlagRepo } from './mongo/feature-flag.repo.js';

export interface Repositories {
  users: UserRepo;
  refreshTokens: RefreshTokenRepo;
  recipes: RecipeRepo;
  favourites: FavouriteRepo;
  feedback: FeedbackRepo;
  extractions: ExtractionRepo;
  aiAudit: AiAuditRepo;
  prompts: PromptRepo;
  featureFlags: FeatureFlagRepo;
}

export const repos: Repositories = {
  users: new MongoUserRepo(),
  refreshTokens: new MongoRefreshTokenRepo(),
  recipes: new MongoRecipeRepo(),
  favourites: new MongoFavouriteRepo(),
  feedback: new MongoFeedbackRepo(),
  extractions: new MongoExtractionRepo(),
  aiAudit: new MongoAiAuditRepo(),
  prompts: new MongoPromptRepo(),
  featureFlags: new MongoFeatureFlagRepo(),
};

export * from './ports.js';
