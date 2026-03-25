import { apiClient } from '@/shared/api/client';
import type { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';

type CreateApprovalResponse = {
  title: string;
  purchese_type: string;
  amount: number;
  reason: string;
};

export const createApprovalApi = async (data: CreateApprovalRequestTypes): Promise<CreateApprovalResponse> => {
  return apiClient<CreateApprovalResponse>('/approvals/new', {
    method: 'POST',
    body: data,
  });
};
