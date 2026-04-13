'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { DetailRow } from './componetns/detailRow';
import { useGetApprovalDetail } from './hooks/use-get-approval-detail';
import { PageLoading } from '@/shared/components/page-loading';
import { formatNumberWithComma } from '@/shared';

type ApprovalDetailProps = {
  id: string;
};

export function ApprovalDetail({ id }: ApprovalDetailProps) {
  const { data, isPending, isError, error } = useGetApprovalDetail(id);

  console.log(`data: ${data?.id}`);

  // NOTE: 取得中はスケルトン
  if (isPending) return <PageLoading message="取得中..." />;

  if (!data) return <div>データが見つかりませんでした</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{`申請詳細画面 ID: ${data.id}`}</CardTitle>
        </CardHeader>

        <CardContent>
          <span>承認日</span>
          <div>{data.approved_at}</div>
        </CardContent>

        <CardContent>
          <DetailRow label="タイトル" value={data?.title} />
          <DetailRow label="購買種別" value={data?.purchase_type} />
          <DetailRow label="購入金額" value={formatNumberWithComma(data.amount.toString() ?? null)} />
          <DetailRow label="申請理由" value={data?.reason} multiline />
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              console.log('onTest');
            }}
          >
            一覧へ戻る
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              console.log('承認ボタン(仮)');
            }}
            disabled={false}
          >
            承認ボタン(仮)
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
