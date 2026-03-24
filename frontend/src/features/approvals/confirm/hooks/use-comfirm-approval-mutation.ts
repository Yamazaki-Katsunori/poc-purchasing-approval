'use client';

import { useMutation } from '@tanstack/react-query';
import { ApprovalsNewFormTypes } from '../../new/schemas/approvals-new-schema';
import { confirmApprovalApi } from '../api/confirm-approval';

export function useConfirmApprovalMutation() {
  return useMutation({
    mutationFn: (data: ApprovalsNewFormTypes) => confirmApprovalApi(data),
  });
}
