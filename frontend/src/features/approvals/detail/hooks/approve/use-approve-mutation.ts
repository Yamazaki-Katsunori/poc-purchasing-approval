import { useMutation } from '@tanstack/react-query';
import { approveApi } from '../../api/approve-api';

export function useApproveMutation() {
  return useMutation({
    mutationFn: (id: number) => approveApi(id),
    onSuccess: () => console.log('承認成功'),
    onError: () => console.log('承認失敗'),
  });
}
