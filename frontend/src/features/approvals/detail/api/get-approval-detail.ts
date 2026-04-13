import { apiClient } from '@/shared/api/client';
import { ApprovalDetailResponseTpyes } from '../schemas/approval-detail-schema';

export const getApprovalDetail = async (id: string): Promise<ApprovalDetailResponseTpyes> => {
  return apiClient(`/approvals/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
