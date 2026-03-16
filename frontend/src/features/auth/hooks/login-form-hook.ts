'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginSchema, LoginValueTypes } from '../schemas/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from './login-mutation';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENT_USER_QUERY_KEY } from '@/features/layouts/hooks/useCurrentUser';

export const useLoginForm = () => {
  const form = useForm<LoginValueTypes>({
    resolver: zodResolver(LoginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutaion = useLoginMutation();

  const onSubmit: SubmitHandler<LoginValueTypes> = async (data) => {
    await loginMutaion.mutateAsync(data);

    // 関連queryを再検証
    await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });

    router.push('/');
    router.refresh();
  };

  return {
    ...form,
    onSubmit,
    isPending: loginMutaion.isPending,
    serverError: loginMutaion.error?.message ?? null,
  };
};
