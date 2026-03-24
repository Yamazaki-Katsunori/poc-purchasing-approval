import { apiClient } from '@/shared/api/client';
import { ApprovalsNewFormTypes } from '../../new/schemas/approvals-new-schema';

type ConfirmResponse = {
  status: string;
  message: string;
};

export const confirmApprovalApi = async (data: ApprovalsNewFormTypes): Promise<ConfirmResponse> => {
  return apiClient<ConfirmResponse>('approvals/confirm', {
    method: 'POST',
    body: data,
  });
};
