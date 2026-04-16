import { useRouter } from 'next/navigation';
import { useRejectMutation } from './use-returned-mutation';
import { useQueryClient } from '@tanstack/react-query';

export const useReject = () => {
  const router = useRouter();
  const mutation = useRejectMutation();
  const queryClient = useQueryClient();

  const onReject = async (id: number) => {
    await mutation.mutateAsync(id);

    queryClient.invalidateQueries({ queryKey: ['get', 'approval', 'detail', id] });
    router.push('/');
  };

  return {
    onReject,
    isRejectPending: mutation.isPending,
    isRejectError: mutation.isError,
  };
};
