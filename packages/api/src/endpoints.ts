// Single source of truth for backend URL paths. Apps reach the server through
// the named constants here so a rename touches one line, not dozens.
export const EP = {
  HEALTH: 'api/v1/health',

  // Auth & account
  AUTH_LOGIN: 'api/v1/auth/login',
  AUTH_REGISTER: 'api/v1/auth/register',
  AUTH_REFRESH: 'api/v1/auth/refresh',
  AUTH_LOGOUT: 'api/v1/auth/logout',
  ME: 'api/v1/me',
  ME_PREFS: 'api/v1/me/prefs',

  // Ingredients & kitchen input
  INGREDIENTS_SUGGEST: 'api/v1/ingredients/suggest',
  INGREDIENTS_RECENT: 'api/v1/ingredients/recent',
  INGREDIENTS_EXTRACT_PHOTO: 'api/v1/ingredients/extract/photo',
  INGREDIENTS_EXTRACT_VOICE: 'api/v1/ingredients/extract/voice',

  // Suggestions & recipes
  SUGGESTIONS: 'api/v1/suggestions',
  RECIPE: (id: string) => `api/v1/recipes/${id}`,

  // Favourites & feedback
  FAVOURITES: 'api/v1/favourites',
  FAVOURITE: (recipeId: string) => `api/v1/favourites/${recipeId}`,
  FEEDBACK: 'api/v1/feedback',

  // Admin — platform management (role: admin)
  ADMIN_METRICS: 'api/v1/admin/metrics',
  ADMIN_USERS: 'api/v1/admin/users',
  ADMIN_USER: (id: string) => `api/v1/admin/users/${id}`,
  ADMIN_RECIPES: 'api/v1/admin/recipes',
  ADMIN_RECIPE: (id: string) => `api/v1/admin/recipes/${id}`,
  ADMIN_RECIPE_PUBLISH: (id: string) => `api/v1/admin/recipes/${id}/publish`,
  ADMIN_RECIPE_UNPUBLISH: (id: string) => `api/v1/admin/recipes/${id}/unpublish`,
  ADMIN_RECIPE_HERO: (id: string) => `api/v1/admin/recipes/${id}/hero`,
  ADMIN_RECIPES_GENERATE: 'api/v1/admin/recipes/generate',
  ADMIN_AI_AUDIT: 'api/v1/admin/ai-audit',
  ADMIN_AI_AUDIT_ITEM: (id: string) => `api/v1/admin/ai-audit/${id}`,
  ADMIN_PROMPTS: 'api/v1/admin/prompts',
  ADMIN_PROMPT: (key: string) => `api/v1/admin/prompts/${key}`,
  ADMIN_FEATURE_FLAGS: 'api/v1/admin/feature-flags',
  ADMIN_FEATURE_FLAG: (key: string) => `api/v1/admin/feature-flags/${key}`,
  ADMIN_FEEDBACK: 'api/v1/admin/feedback',
  ADMIN_FEEDBACK_ITEM: (id: string) => `api/v1/admin/feedback/${id}`,
} as const;
