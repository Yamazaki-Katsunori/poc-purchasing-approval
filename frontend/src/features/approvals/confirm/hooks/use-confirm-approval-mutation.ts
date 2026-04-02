'use client';

import { useMutation } from '@tanstack/react-query';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { confirmApprovalApi } from '@/features/approvals/confirm/api/confirm-approval';
import { toast } from 'sonner';

export function useConfirmApprovalMutation() {
  return useMutation({
    mutationFn: (data: CreateApprovalRequestTypes) => confirmApprovalApi(data),
    onSuccess: () => toast.success('申請を作成しました'),
    onError: () => toast.error('申請の作成が失敗しました'),
  });
}
