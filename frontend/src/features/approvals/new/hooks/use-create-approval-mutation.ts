'use client';

import { useMutation } from '@tanstack/react-query';
import { ApprovalsNewFormTypes } from '../schemas/approvals-new-schema';
import { createApprovalApi } from '../api/create-approval';

export function useCreateApprovalMutation() {
  return useMutation({
    mutationFn: (data: ApprovalsNewFormTypes) => createApprovalApi(data),
  });
}
