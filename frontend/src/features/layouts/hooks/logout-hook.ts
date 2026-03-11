'use client';

import { logoutApi } from '@/features/api/logout';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutApi();

    router.push('/login');
    router.refresh();
  };

  return { handleLogout };
};
