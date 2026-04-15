import { apiClient } from '@/shared/api/client';

export const rejectApi = (id: number) => {
  return apiClient('/reject', {
    method: 'POST',
    body: id,
    credentials: 'include',
    cache: 'no-store',
  });
};
