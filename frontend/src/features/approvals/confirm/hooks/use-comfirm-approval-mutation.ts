'use client';

import { useMutation } from '@tanstack/react-query';
import { CreateApprovalRequestTypes } from '../../schemas/approvals-new-schema';
import { confirmApprovalApi } from '../api/confirm-approval';

export function useConfirmApprovalMutation() {
  return useMutation({
    mutationFn: (data: CreateApprovalRequestTypes) => confirmApprovalApi(data),
  });
}
