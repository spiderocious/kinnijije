// Centralised route table. Apps import from here so route strings have
// exactly one source of truth across web + admin + website surfaces.
export const ROUTES = {
  // Public marketing
  HOME: '/',
  ABOUT: '/about',
  PRIVACY: '/privacy',

  // Auth (consumer)
  LOGIN: '/login',
  REGISTER: '/register',

  // Onboarding
  ONBOARDING: '/onboarding',

  // Consumer app
  KITCHEN: '/kitchen',
  SUGGESTIONS: '/suggestions',
  RECIPE: (id: string) => `/recipe/${id}`,
  COOK: (id: string) => `/recipe/${id}/cook`,
  FAVOURITES: '/favourites',
  SETTINGS: '/settings',

  // Design system preview (the @kinnijije/ui storybook-lite)
  PREVIEW: '/preview',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_HOME: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER: (id: string) => `/admin/users/${id}`,
  ADMIN_RECIPES: '/admin/recipes',
  ADMIN_RECIPE: (id: string) => `/admin/recipes/${id}`,
  ADMIN_RECIPE_NEW: '/admin/recipes/new',
  ADMIN_AI_AUDIT: '/admin/ai-audit',
  ADMIN_AI_AUDIT_ITEM: (id: string) => `/admin/ai-audit/${id}`,
  ADMIN_PROMPTS: '/admin/prompts',
  ADMIN_FEATURE_FLAGS: '/admin/feature-flags',
  ADMIN_FEEDBACK: '/admin/feedback',
} as const;
