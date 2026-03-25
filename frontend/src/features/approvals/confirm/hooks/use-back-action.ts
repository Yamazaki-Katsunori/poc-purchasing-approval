import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { CreateApprovalRequestTypes } from '../../schemas/approvals-new-schema';

export function useBackAction() {
  const router = useRouter();
  const setApprovalAtom = useSetAtom(approvalCreateAtom);

  const onCansel = async (data: CreateApprovalRequestTypes | null) => {
    setApprovalAtom(data);
    router.push('/approvals/new');
  };

  return {
    onCansel,
  };
}
