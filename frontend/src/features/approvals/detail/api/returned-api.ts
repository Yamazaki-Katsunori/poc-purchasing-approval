import { apiClient } from '@/shared/api/client';

export const returnedApi = (id: number) => {
  return apiClient(`/approvals/${id}/return`, {
    method: 'POST',
    body: id,
    credentials: 'include',
    cache: 'no-store',
  });
};
