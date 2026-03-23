'use client';

import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useCreateApprovalMutation } from './use-create-approval-mutation';
import type { ApprovalsNewFormTypes } from '../schemas/approvals-new-schema';

export const useApprovalCreateAction = () => {
  const router = useRouter();
  const setApprovalCreate = useSetAtom(approvalCreateAtom);
  const mutation = useCreateApprovalMutation();

  const onSubmit = async (data: ApprovalsNewFormTypes) => {
    await mutation.mutateAsync(data);
    setApprovalCreate(data);
    router.push('/approvals/new/confirm');
  };

  const onCancel = async () => {
    setApprovalCreate(null);
    router.push('/');
    router.refresh();
  };

  return {
    onSubmit,
    onCancel,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
