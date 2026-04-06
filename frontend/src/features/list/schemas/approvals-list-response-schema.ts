import z from 'zod';

export const ApprovalListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  approval_user: z.string(),
  approval_status: z.string(),
  requested_at: z.string().optional(),
  created_at: z.string(),
  approved_at: z.string().optional(),
});

export const ApprovalListResponseSchema = z.object({
  items: z.array(ApprovalListItemSchema),
});

export type ApprovalListItemTypes = z.infer<typeof ApprovalListItemSchema>;
export type ApprovalListResponseTypes = z.infer<typeof ApprovalListResponseSchema>;
