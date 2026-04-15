import { useRouter } from 'next/navigation';

export const useBackHome = () => {
  const router = useRouter();

  const onBackHome = () => {
    router.push('/');
  };

  return {
    onBackHome,
  };
};
