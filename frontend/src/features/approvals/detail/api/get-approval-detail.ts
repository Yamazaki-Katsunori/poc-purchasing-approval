import { apiClient } from '@/shared/api/client';

export const getApprovalDetail = async (id: string) => {
  return apiClient(`/approvals/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
