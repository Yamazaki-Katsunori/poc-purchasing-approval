'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { DetailRow } from './componetns/detailRow';
import { useGetApprovalDetail } from './hooks/use-get-approval-detail';
import { PageLoading } from '@/shared/components/page-loading';
import { formatNumberWithComma } from '@/shared';
import { formatJapaneseDateTime } from '@/shared/formatter/format-datetime';

type ApprovalDetailProps = {
  id: string;
};

export function ApprovalDetail({ id }: ApprovalDetailProps) {
  const { data, isPending, isError, error } = useGetApprovalDetail(id);

  if (isPending) return <PageLoading message="取得中..." />;
  if (isError) return <div>{error.message}</div>;
  if (!data) return <div>データが見つかりませんでした</div>;

  const approval_status = data.current_status;
  const approval_event = data.current_event;
  const approval_event_perfomer = approval_event?.performer;

  const approval_user_roles = data.user.roles.map((role) => role.name).join(' / ');
  const performer_roles = approval_event_perfomer?.roles.map((role) => role.name).join(' / ');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{`申請詳細画面 ID: ${data.id}`}</CardTitle>
        </CardHeader>

        {/* ここに申請情報のうち 申請者、申請日,承認日,作成日, 申請ステータス,*/}
        <CardContent className="">
          <CardTitle className="">申請ステータス</CardTitle>
          <div>
            <span>作成者:</span>
            <div>{data.user.name}</div>
          </div>

          <div>
            <span>作成者権限:</span>
            <div>{approval_user_roles}</div>
          </div>

          <div>
            <span>最終実行者:</span>
            <div>{approval_event_perfomer?.name ?? ''}</div>
          </div>

          <div>
            <span>最終実行者権限:</span>
            <div>{performer_roles}</div>
          </div>

          <div>
            <span>最終申請ステータス:</span>
            <div>{approval_status?.name}</div>
          </div>

          <div>
            <span>最終実行ステータス</span>
            <div>{approval_event?.action}</div>
          </div>

          <div>
            <span>承認日:</span>
            <div>{formatJapaneseDateTime(data.requested_at)}</div>
          </div>

          <div>
            <span>作成日:</span>
            <div>{formatJapaneseDateTime(data.created_at)}</div>
          </div>

          <div>
            <span>申請日:</span>
            <div>{formatJapaneseDateTime(data.approved_at)}</div>
          </div>
        </CardContent>

        <CardContent>
          <CardTitle>申請内容</CardTitle>
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
