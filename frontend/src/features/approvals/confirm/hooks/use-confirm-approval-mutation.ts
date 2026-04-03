'use client';

import { useMutation } from '@tanstack/react-query';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { confirmApprovalApi } from '@/features/approvals/confirm/api/confirm-approval';
import { toast } from 'sonner';
import { APPROVAL_TOAST_IDS } from '@/shared/constants/approvals/toast-successes';

export function useConfirmApprovalMutation() {
  return useMutation({
    mutationFn: (data: CreateApprovalRequestTypes) => confirmApprovalApi(data),
    onSuccess: () =>
      toast.success('申請を作成しました', {
        id: APPROVAL_TOAST_IDS.CREATED_APPROVAL_SUCCESS,
      }),
    onError: () =>
      toast.error('申請の作成が失敗しました', {
        id: APPROVAL_TOAST_IDS.CREATED_APPROVAL_FAILED,
      }),
  });
}
