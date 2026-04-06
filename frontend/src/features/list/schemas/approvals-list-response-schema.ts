import z from 'zod';

export const ApprovalListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  purchaseType: z.string(),
  amount: z.number(),
  status: z.string(),
  created_at: z.string(),
});

export const ApprovalListResponseSchema = z.object({
  items: z.array(ApprovalListItemSchema),
});

export type ApprovalListItemTypes = z.infer<typeof ApprovalListItemSchema>;
export type ApprovalListResponseTypes = z.infer<typeof ApprovalListResponseSchema>;
