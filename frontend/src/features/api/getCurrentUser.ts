// features/auth/apis/getCurrentUser.ts

import { apiClient } from '@/shared/api/client';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  position_name: string | null;
  role_name: string | null;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  return apiClient('/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
