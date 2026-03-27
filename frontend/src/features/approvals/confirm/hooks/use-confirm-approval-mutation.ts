'use client';

import { useMutation } from '@tanstack/react-query';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { confirmApprovalApi } from '@/features/approvals/confirm/api/confirm-approval';

export function useConfirmApprovalMutation() {
  return useMutation({
    mutationFn: (data: CreateApprovalRequestTypes) => confirmApprovalApi(data),
  });
}
