import z from 'zod';

export const ApprovalsNewFormSchema = z.object({
  title: z.string(),
  purchese_type: z.string(),
  amount: z.string(),
  reason: z.string(),
});

export type ApprovalsNewFormTypes = z.infer<typeof ApprovalsNewFormSchema>;
