import { apiClient } from '@/shared/api/client';
import { ApprovalListRequestQueryTypes, ApprovalListResponseTypes } from '../schemas/approvals-list-response-schema';

export const getApprovals = async ({
  page,
  per_page,
}: ApprovalListRequestQueryTypes): Promise<ApprovalListResponseTypes> => {
  const searchParams = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  });

  return apiClient(`/approvals?${searchParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
