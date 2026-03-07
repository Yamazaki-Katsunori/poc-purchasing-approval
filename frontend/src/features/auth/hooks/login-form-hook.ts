'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginSchema, LoginValueTypes } from '../schemas/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

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
  const onSubmit: SubmitHandler<LoginValueTypes> = async (data) => {
    document.cookie = 'mock_token=dummy-token; path=/';
    router.push('/');
    router.refresh();

    console.log(`document.cookie: ${document.cookie}`);
  };

  return {
    ...form,
    onSubmit,
  };
};
