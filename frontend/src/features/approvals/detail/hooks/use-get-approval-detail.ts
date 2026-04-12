import { useQuery } from '@tanstack/react-query';
import { getApprovalDetail } from '../api/get-approval-detail';

export const useGetApprovalDetail = (id: string) => {
  return useQuery({
    queryKey: ['get', 'approval', 'detail', id],
    queryFn: () => getApprovalDetail(id),
  });
};
