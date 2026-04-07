import { useQuery } from '@tanstack/react-query';
import { getApprovals } from '../api/get-approvals';
import { ApprovalListResponseTypes } from '../schemas/approvals-list-response-schema';

export function useApprovalsQuery() {
  return useQuery<ApprovalListResponseTypes>({
    queryKey: ['get', 'approvals'],
    queryFn: () => getApprovals(),
    retry: false,
  });
}
