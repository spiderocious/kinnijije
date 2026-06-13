// Centralised React Query keys, so cache invalidation across features is
// explicit and collision-free. Each feature imports the keys it needs.
export const QK = {
  me: ['me'] as const,
  metrics: ['admin', 'metrics'] as const,

  users: (params: { q?: string; cursor?: string }) =>
    ['admin', 'users', params.q ?? '', params.cursor ?? ''] as const,
  user: (id: string) => ['admin', 'user', id] as const,

  recipes: (params: { status?: string; source?: string; cursor?: string }) =>
    ['admin', 'recipes', params.status ?? '', params.source ?? '', params.cursor ?? ''] as const,
  recipe: (id: string) => ['admin', 'recipe', id] as const,

  aiAudit: (params: { kind?: string; status?: string; cursor?: string }) =>
    ['admin', 'ai-audit', params.kind ?? '', params.status ?? '', params.cursor ?? ''] as const,
  aiAuditItem: (id: string) => ['admin', 'ai-audit', id] as const,

  prompts: ['admin', 'prompts'] as const,
  promptVersions: (key: string) => ['admin', 'prompts', key] as const,

  featureFlags: ['admin', 'feature-flags'] as const,

  feedback: (params: { status?: string; cursor?: string }) =>
    ['admin', 'feedback', params.status ?? '', params.cursor ?? ''] as const,
} as const;
