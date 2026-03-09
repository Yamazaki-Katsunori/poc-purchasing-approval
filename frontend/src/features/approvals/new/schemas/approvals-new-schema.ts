import z from 'zod';

export const ApprovalsNewFormSchema = z.object({
  title: z.string().min(1, { error: 'タイトルは1文字以上入力してください' }),
  purchese_type: z.string(),
  amount: z
    .string()
    .min(1, { error: '購入金額は1円以上入力してください' })
    .regex(/^\d+$/, '購入金額は数字のみ入力してください'),
  reason: z.string(),
});

export type ApprovalsNewFormTypes = z.infer<typeof ApprovalsNewFormSchema>;
