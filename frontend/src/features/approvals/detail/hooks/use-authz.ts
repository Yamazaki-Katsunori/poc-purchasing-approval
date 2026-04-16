import { useCurrentUser } from '@/shared/hooks/auth/useCurrentUser';

export function useAuthz() {
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const isApprover = currentUser?.role_name === 'approver' || currentUser?.role_name === 'admin';
  const isApplicant = currentUser?.role_name === 'applicant';

  return {
    currentUser,
    isLoading,
    isError,
    isApprover: isApprover,
    isApplicant: isApplicant,
  };
}
