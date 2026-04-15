import { useMutation } from '@tanstack/react-query';
import { rejectApi } from '../../api/reject-api';

export function useRejectMutation() {
  return useMutation({
    mutationFn: (id: number) => rejectApi(id),
    onSuccess: () => console.log('申請を却下しました'),
    onError: () => console.log('申請却下処理がエラーとなりました'),
  });
}
