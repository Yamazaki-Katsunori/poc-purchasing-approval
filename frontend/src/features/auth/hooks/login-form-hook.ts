'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginSchema, LoginValueTypes } from '../schemas/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from './login-mutation';

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
  const loginMutaion = useLoginMutation();

  const onSubmit: SubmitHandler<LoginValueTypes> = async (data) => {
    const result = await loginMutaion.mutateAsync(data);

    console.debug(result);

    router.push('/');
    router.refresh();

    console.log(`document.cookie: ${document.cookie}`);
  };

  return {
    ...form,
    onSubmit,
    isPendng: loginMutaion.isPending,
    serverError: loginMutaion.error?.message ?? null,
  };
};
