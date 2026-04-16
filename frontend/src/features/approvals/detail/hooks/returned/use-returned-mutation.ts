import { useMutation } from '@tanstack/react-query';
import { returnedApi } from '../../api/returned-api';

export function useRejectMutation() {
  return useMutation({
    mutationFn: (id: number) => returnedApi(id),
    onSuccess: () => console.log('申請を却下しました'),
    onError: () => console.log('申請却下処理がエラーとなりました'),
  });
}
