import { apiClient } from '@/shared/api/client';

export type ApproveResponse = {
  message: string;
};

export const approveApi = (id: number): Promise<ApproveResponse> => {
  return apiClient<ApproveResponse>('/approve', {
    method: 'POST',
    body: id,
    credentials: 'include',
    cache: 'no-store',
  });
};
