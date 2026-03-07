import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'mock_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    router.push('/login');
    router.refresh();
  };

  return { handleLogout };
};
