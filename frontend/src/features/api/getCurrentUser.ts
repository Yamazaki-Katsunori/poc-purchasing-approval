// features/auth/apis/getCurrentUser.ts

import { apiClient } from '@/shared/api/client';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  positionName: string | null;
  roleName: string | null;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  return apiClient('/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};
