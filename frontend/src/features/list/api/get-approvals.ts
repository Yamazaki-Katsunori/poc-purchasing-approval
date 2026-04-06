import { apiClient } from '@/shared/api/client';
import { ApprovalListResponseTypes } from '../schemas/approvals-list-response-schema';

export const getApprovals = async (): Promise<ApprovalListResponseTypes> => {
  return apiClient(`/approvals`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
