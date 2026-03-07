'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginSchema, LoginValueTypes } from '../schemas/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';

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

  const onSubmit: SubmitHandler<LoginValueTypes> = async (data) => {
    console.log('submit data', data);
  };

  return {
    ...form,
    onSubmit,
  };
};
