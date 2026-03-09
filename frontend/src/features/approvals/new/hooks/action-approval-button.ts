import { useRouter } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { ApprovalsNewFormTypes } from '../schemas/approvals-new-schema';

export const useApprovalButton = () => {
  const router = useRouter();

  const onSubmit: SubmitHandler<ApprovalsNewFormTypes> = async () => {
    router.push('/approvals/new/confirm');
    router.refresh();
  };

  const onCancel = async () => {
    router.push('/');
    router.refresh();
  };

  return { onSubmit, onCancel };
};
