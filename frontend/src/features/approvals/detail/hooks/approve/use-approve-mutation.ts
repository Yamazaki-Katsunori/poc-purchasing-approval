import { useMutation } from '@tanstack/react-query';
import { approveApi } from '../../api/approve-api';
import { toast } from 'sonner';

export function useApproveMutation() {
  return useMutation({
    mutationFn: (id: number) => approveApi(id),
    onSuccess: () => toast.success('承認を実行しました'),
    onError: () => toast.error('承認処理に失敗しました'),
  });
}
