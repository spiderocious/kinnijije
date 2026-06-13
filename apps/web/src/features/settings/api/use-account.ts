import { useMutation } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';

import { api } from '@shared/api/client.ts';
import { tokenService } from '@shared/services/token-service.ts';

// DELETE /me — irreversible account deletion. Clears local tokens on success.
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete(EP.ME),
    onSuccess: () => tokenService.clear(),
  });
}
