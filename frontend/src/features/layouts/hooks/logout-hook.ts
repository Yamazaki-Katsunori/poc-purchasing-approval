'use client';

import { logoutApi } from '@/features/api/logout';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CURRENT_USER_QUERY_KEY } from './useCurrentUser';

export const useLogout = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logoutApi();

    // 即時に未ログイン状態へ
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);

    // 関連queryも再検証
    await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    router.push('/login');
    router.refresh();
  };

  return { handleLogout };
};
