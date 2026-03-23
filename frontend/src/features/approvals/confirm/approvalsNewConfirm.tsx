'use client';

import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useAtomValue } from 'jotai';

export default function ApprovalNewConfirm() {
  const getAtom = useAtomValue(approvalCreateAtom);

  const createdApproval = {
    title: getAtom?.title,
    purchase_type: getAtom?.purchase_type,
    amount: getAtom?.amount,
    reason: getAtom?.reason,
  };

  return (
    <main>
      this is Approval New Confirm Page!!
      <ul>
        <li>{createdApproval.title}</li>
        <li>{createdApproval.purchase_type}</li>
        <li>{createdApproval.amount}</li>
        <li>{createdApproval.reason}</li>
      </ul>
    </main>
  );
}
