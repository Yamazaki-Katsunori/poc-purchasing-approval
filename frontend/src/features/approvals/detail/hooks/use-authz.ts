import { useCurrentUser } from '@/shared/hooks/auth/useCurrentUser';

export function useAuthz() {
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  return {
    currentUser,
    isLoading,
    isError,
    isApprover: currentUser?.role_name === 'approver',
    isApplicant: currentUser?.role_name === 'applicant',
  };
}
