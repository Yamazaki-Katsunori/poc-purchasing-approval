'use client';

import { useMutation } from '@tanstack/react-query';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { createApprovalApi } from '@/features/approvals/new/api/create-approval';

export function useCreateApprovalMutation() {
  return useMutation({
    mutationFn: (data: CreateApprovalRequestTypes) => createApprovalApi(data),
  });
}
