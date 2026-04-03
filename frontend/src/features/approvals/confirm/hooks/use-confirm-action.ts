import { useRouter } from 'next/navigation';
import { useConfirmApprovalMutation } from './use-confirm-approval-mutation';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { assertCreateApprovalRequestData } from '@/features/approvals/confirm/guards/asserts';
import { useSetAtom } from 'jotai';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';

export function useConfirmAction() {
  const router = useRouter();
  const mutation = useConfirmApprovalMutation();
  const setApprovalAtom = useSetAtom(approvalCreateAtom);

  const onSubmit = async (data: CreateApprovalRequestTypes | null) => {
    assertCreateApprovalRequestData(data);

    await mutation.mutateAsync(data);

    setApprovalAtom(null);
    router.push('/');
  };

  return {
    onSubmit,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
