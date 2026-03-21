import { apiClient } from '@/shared/api/client';

export type LogoutResponse = {
  message: string;
};

export async function logoutApi(): Promise<LogoutResponse> {
  return apiClient<LogoutResponse>('/auth/logout', {
    method: 'POST',
  });
}
