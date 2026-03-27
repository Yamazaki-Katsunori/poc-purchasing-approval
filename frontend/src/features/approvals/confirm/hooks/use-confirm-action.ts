import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useConfirmApprovalMutation } from './use-confirm-approval-mutation';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { assertCreateApprovalRequestData } from '@/features/approvals/confirm/guards/asserts';

export function useConfirmAction() {
  const router = useRouter();
  const setApprovalAtom = useSetAtom(approvalCreateAtom);
  const mutation = useConfirmApprovalMutation();

  const onSubmit = async (data: CreateApprovalRequestTypes | null) => {
    assertCreateApprovalRequestData(data);

    await mutation.mutateAsync(data);

    // TODO: 正常に登録完了したら、sessionStorageから入力情報を削除する
    setApprovalAtom(null);
    router.push('/');
    router.refresh();
  };

  return {
    onSubmit,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
