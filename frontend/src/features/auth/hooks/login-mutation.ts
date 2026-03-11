'use client';

import { loginApi } from '@/features/api/login';
import { useMutation } from '@tanstack/react-query';
import { LoginValueTypes } from '../schemas/login-schema';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginValueTypes) => loginApi(data),
  });
}
