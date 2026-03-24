'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { formatNumberWithComma } from '@/shared/numberInputs/numberInput';
import { useAtomValue } from 'jotai';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';

const purchaseTypeLabelMap: Record<string, string> = {
  goods: '物品',
  service: 'サービス',
  equipment: '備品',
};

function ConfirmRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="p-2">
      <div className="mb-2 text-sm font-medium text-gray-700">{label}</div>
      <div
        className={[
          'w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900',
          multiline ? 'min-h-[120px] whitespace-pre-wrap' : '',
        ].join(' ')}
      >
        {value || '—'}
      </div>
    </div>
  );
}

// debug用
const isPending = false;
const onSubmit = () => {
  console.log('click!');
};

export function ApprovalsNewConfirm() {
  const getApprovalValues = useAtomValue(approvalCreateAtom);

  const purchaseTypeLabel = getApprovalValues?.purchase_type ?? '-';
  const amountLabel = getApprovalValues?.amount ? `${formatNumberWithComma(getApprovalValues?.amount)} 円` : '-';
  const titleLabel = getApprovalValues?.title ?? '-';
  const reasonLabel = getApprovalValues?.reason ?? '-';

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
        <Button type="button" variant="secondary" onClick={onSubmit}>
          入力画面へ戻る
        </Button>

        <Button type="button" variant="primary" onClick={onSubmit} disabled={isPending}>
          {isPending ? '申請中...' : 'この内容で申請する'}
        </Button>
      </CardFooter>

      {/* {error ? <p className="px-6 pb-4 text-sm text-red-500">{error}</p> : null} */}
    </Card>
  );
}
