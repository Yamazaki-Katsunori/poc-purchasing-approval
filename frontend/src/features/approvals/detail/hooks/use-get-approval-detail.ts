import { useQuery } from '@tanstack/react-query';
import { getApprovalDetail } from '../api/get-approval-detail';
import { ApprovalDetailResponseTpyes } from '../schemas/approval-detail-schema';

export const useGetApprovalDetail = (id: string) => {
  return useQuery<ApprovalDetailResponseTpyes>({
    queryKey: ['get', 'approval', 'detail', id],
    queryFn: () => getApprovalDetail(id),
    retry: false,
  });
};
