import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { BannerHost, ModalHost, ToastHost } from '@kinnijije/ui';

import { AuthProvider } from '@features/auth/providers/auth-provider.tsx';

// Global providers, mounted once at the root. Query client + router + the auth
// context, plus the imperative overlay hosts (toasts/modals/banners) the
// DrawerService renders into.
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
        <ToastHost />
        <BannerHost />
        <ModalHost />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
