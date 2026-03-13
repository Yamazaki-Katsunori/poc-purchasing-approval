// features/auth/hooks/useCurrentUser.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/features/api/getCurrentUser';

export const CURRENT_USER_QUERY_KEY = ['auth', 'current-user'];

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
