import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useApproveMutation } from './use-approve-mutation';

export const useApprove = () => {
  const mutation = useApproveMutation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const onApprove = async (id: number) => {
    await mutation.mutateAsync(id);

    // 承認ステータスを更新するため、queryKeyを再取得させる
    queryClient.invalidateQueries({ queryKey: ['get', 'approval', 'detail', id] });
    router.push('/');
  };

  return {
    onApprove,
    isApprovePending: mutation.isPending,
    isApproveError: mutation.isError,
  };
};
