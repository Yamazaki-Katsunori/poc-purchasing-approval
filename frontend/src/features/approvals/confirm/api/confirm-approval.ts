import { apiClient } from '@/shared/api/client';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';

type ConfirmResponse = {
  status: string;
  message: string;
};

export const confirmApprovalApi = async (data: CreateApprovalRequestTypes): Promise<ConfirmResponse> => {
  return apiClient<ConfirmResponse>('approvals/confirm', {
    method: 'POST',
    body: data,
  });
};
