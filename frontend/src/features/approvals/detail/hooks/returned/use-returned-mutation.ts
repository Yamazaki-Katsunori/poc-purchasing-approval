import { useMutation } from '@tanstack/react-query';
import { returnedApi } from '../../api/returned-api';
import { toast } from 'sonner';

export function useRejectMutation() {
  return useMutation({
    mutationFn: (id: number) => returnedApi(id),
    onSuccess: () => toast.success('差し戻しを実行しました'),
    onError: () => toast.error('差し戻し処理に失敗しました'),
  });
}
