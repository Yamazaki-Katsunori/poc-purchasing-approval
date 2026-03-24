import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { ApprovalsNewFormTypes } from '../../new/schemas/approvals-new-schema';
import { useConfirmApprovalMutation } from './use-comfirm-approval-mutation';

export function useBackAction() {
  const router = useRouter();
  const setApprovalAtom = useSetAtom(approvalCreateAtom);
  // const mutation = useConfirmApprovalMutation();

  // const onSubmit = async (data: ApprovalsNewFormTypes) => {
  //   await mutation.mutateAsync(data);
  //
  //   // TODO: 正常に登録完了したら、sessionStorageから入力情報を削除する
  //   setApprovalAtom(null);
  //   router.push('/');
  //   router.refresh();
  // };

  const onCansel = async (data: ApprovalsNewFormTypes | null) => {
    setApprovalAtom(null);
    router.push('/approvals/new');
  };

  return {
    onCansel,
    // inPending: mutation.isPending,
    // error: mutation.error,
  };
}
