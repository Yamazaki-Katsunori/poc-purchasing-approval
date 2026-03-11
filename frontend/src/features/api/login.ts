import { apiClient } from '@/shared/api/client';
import { LoginValueTypes } from '../auth/schemas/login-schema';

export type LoginResponse = {
  access_token: string;
  token_type: 'bearer';
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export const loginApi = async (data: LoginValueTypes): Promise<LoginResponse> => {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
};
