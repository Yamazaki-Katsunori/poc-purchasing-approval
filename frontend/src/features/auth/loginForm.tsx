'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input } from '@/ui';
import { useLoginForm } from './hooks/login-form-hook';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    onSubmit,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="">ログイン</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="p-2">
            <label htmlFor="email">メールアドレス:</label>
            <span> {isSubmitted && errors.email && <p className="text-red-500">{errors.email.message}</p>}</span>
            <Input id="email" type="email" placeholder="メールアドレスを入力してください" {...register('email')} />
          </div>

          <div className="p-2">
            <label htmlFor="password">パスワード:</label>
            <span> {isSubmitted && errors.password && <p className="text-red-500">{errors.password.message}</p>}</span>
            <Input id="password" type="password" placeholder="パスワードを入力してください" {...register('password')} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end-safe">
          <Button type="submit" className="" variant="primary">
            ログイン
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
