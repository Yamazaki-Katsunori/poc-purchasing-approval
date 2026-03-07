import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email({ error: 'メールアドレス形式で入力してください' }),
  password: z.string().min(1, { error: 'パスワードを入力してください' }),
});

export type LoginValueTypes = z.infer<typeof LoginSchema>;
