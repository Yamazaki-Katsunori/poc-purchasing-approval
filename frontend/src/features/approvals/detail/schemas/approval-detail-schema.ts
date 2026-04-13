import z from 'zod';

export const ApprovalDetailStatusResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
});

export const ApprovalDetailUserRoleResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ApprovalDetailUserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  roles: z.array(ApprovalDetailUserRoleResponseSchema),
});

export const ApprovalDetailEventPerformerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  roles: z.array(ApprovalDetailUserRoleResponseSchema),
});

export const ApprovalDetailEventResponseSchema = z.object({
  id: z.number(),
  subject_type: z.string(),
  subject_id: z.number(),
  performed_by: z.number().nullable(),
  status_id: z.number(),
  action: z.string(),
  comment: z.string().nullable(),
  event_at: z.string(),
  performer: ApprovalDetailEventPerformerResponseSchema.nullable(),
});

export const ApprovalDetailResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  purchase_type: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string().nullable(),
  created_at: z.string(),
  approved_at: z.string().nullable(),
  current_status: ApprovalDetailStatusResponseSchema.nullable(),
  current_event: ApprovalDetailEventResponseSchema.nullable(),
  user: ApprovalDetailUserResponseSchema,
});

export type ApprovalDetailResponseTpyes = z.infer<typeof ApprovalDetailResponseSchema>;
