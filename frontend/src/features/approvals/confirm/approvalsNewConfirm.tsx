'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { formatNumberWithComma } from '@/shared/numberInputs/numberInput';
import { useAtomValue } from 'jotai';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { ConfirmRow } from './components/confirmRow';
import { useBackAction } from './hooks/use-back-action';
import { useConfirmAction } from './hooks/use-confirm-action';

export function ApprovalsNewConfirm() {
  const getApprovalValues = useAtomValue(approvalCreateAtom);

  const purchaseTypeLabel = getApprovalValues?.purchase_type ?? '-';
  const amountLabel = getApprovalValues?.amount ? `${formatNumberWithComma(getApprovalValues?.amount)} 円` : '-';
  const titleLabel = getApprovalValues?.title ?? '-';
  const reasonLabel = getApprovalValues?.reason ?? '-';

  const { onCansel } = useBackAction();
  const { onSubmit, isPending, error } = useConfirmAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle>購買新規申請確認</CardTitle>
      </CardHeader>

      <CardContent>
        <ConfirmRow label="タイトル" value={titleLabel} />
        <ConfirmRow label="購買種別" value={purchaseTypeLabel} />
        <ConfirmRow label="購入金額" value={amountLabel} />
        <ConfirmRow label="申請理由" value={reasonLabel} multiline />
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            onCansel(getApprovalValues);
          }}
        >
          入力画面へ戻る
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            onSubmit(getApprovalValues);
          }}
          disabled={isPending}
        >
          {isPending ? '申請中...' : 'この内容で申請する'}
        </Button>
      </CardFooter>

      {error?.message ? <p className="px-6 pb-4 text-sm text-red-500">{error.message}</p> : null}
    </Card>
  );
}
