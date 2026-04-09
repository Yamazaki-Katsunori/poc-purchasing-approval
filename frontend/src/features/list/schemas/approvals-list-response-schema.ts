import z from 'zod';

export const ApprovalListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  approval_user: z.string(),
  approval_status: z.string(),
  requested_at: z.string().nullable(),
  created_at: z.string(),
  approved_at: z.string().nullable(),
});

export const ApprovalListPaginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_prev: z.boolean(),
  has_next: z.boolean(),
});

export const ApprovalListRequestQuerySchema = z.object({
  page: z.number(),
  per_page: z.number(),
});

export const ApprovalListResponseSchema = z.object({
  items: z.array(ApprovalListItemSchema),
  pagination: ApprovalListPaginationSchema,
});

export type ApprovalListItemTypes = z.infer<typeof ApprovalListItemSchema>;
export type ApprovalListResponseTypes = z.infer<typeof ApprovalListResponseSchema>;
export type ApprovalListRequestQueryTypes = z.infer<typeof ApprovalListRequestQuerySchema>;
