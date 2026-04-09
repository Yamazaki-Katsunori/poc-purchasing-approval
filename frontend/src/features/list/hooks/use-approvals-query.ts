import { useQuery } from '@tanstack/react-query';
import { getApprovals } from '../api/get-approvals';
import { ApprovalListRequestQueryTypes, ApprovalListResponseTypes } from '../schemas/approvals-list-response-schema';

export function useApprovalsQuery({ page, per_page }: ApprovalListRequestQueryTypes) {
  return useQuery<ApprovalListResponseTypes>({
    queryKey: ['get', 'approvals', page, per_page],
    queryFn: () => getApprovals({ page, per_page }),
    retry: false,
  });
}
