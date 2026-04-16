'use client';

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { DetailRow } from './componetns/detailRow';
import { useGetApprovalDetail } from './hooks/use-get-approval-detail';
import { PageLoading } from '@/shared/components/page-loading';
import { formatNumberWithComma } from '@/shared';
import { formatJapaneseDateTime } from '@/shared/formatter/format-datetime';
import { ApprovalDetailMetaInfo } from './componetns/approvalDetailMetaInfo';
import { getApprovalStatusBadgeVariant } from './shard/get-approval-status-badge-meta';
import { useBackHome } from './hooks/use-back-home';
import { useApprove } from './hooks/approve/use-approve';
import { useReject } from './hooks/returned/use-returned';
import { useAuthz } from './hooks/use-authz';

type ApprovalDetailProps = {
  id: string;
};

export function ApprovalDetail({ id }: ApprovalDetailProps) {
  const { data, isPending, isError, error } = useGetApprovalDetail(id);
  const { onBackHome } = useBackHome();
  const { onApprove, isApproveError, isApprovePending } = useApprove();
  const { onReject, isRejectPending, isRejectError } = useReject();
  const { isApplicant, isApprover } = useAuthz();

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
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={getApprovalStatusBadgeVariant(approval_status?.code)}>{`${approval_status?.name}`}</Badge>
            <Badge variant="outline">{`${approval_event?.action}`}</Badge>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <ApprovalDetailMetaInfo label="作成者:" value={data.user.name} />
              <ApprovalDetailMetaInfo label="ロール:" value={approval_user_roles} />
            </div>

            <div className="space-y-1">
              <ApprovalDetailMetaInfo label="最終実行者:" value={approval_event_perfomer?.name} />
              <ApprovalDetailMetaInfo label="ロール:" value={performer_roles} />
            </div>
            <div className="space-y-1">
              <ApprovalDetailMetaInfo label="作成日:" value={formatJapaneseDateTime(data.requested_at)} />
            </div>
            <div className="space-y-1">
              <ApprovalDetailMetaInfo label="申請日:" value={formatJapaneseDateTime(data.created_at)} />
            </div>
            <div className="space-y-1">
              <ApprovalDetailMetaInfo label="承認日:" value={formatJapaneseDateTime(data.approved_at)} />
            </div>
          </div>
        </CardContent>

        <CardContent>
          <CardTitle>申請内容</CardTitle>
          <DetailRow label="タイトル" value={data?.title} />
          <DetailRow label="購買種別" value={data?.purchase_type} />
          <DetailRow label="購入金額" value={formatNumberWithComma(data.amount.toString() ?? null)} />
          <DetailRow label="申請理由" value={data?.reason} multiline />
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onBackHome}>
              一覧へ戻る
            </Button>

            <Button type="button" variant="primary" onClick={() => console.log('編集ボタン')}>
              編集ボタン
            </Button>
          </div>

          {isApprover ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  onReject(data.id);
                }}
                disabled={isRejectPending}
              >
                差し戻し(仮)
              </Button>

              <Button type="button" variant="primary" onClick={() => onApprove(data.id)} disabled={isApprovePending}>
                承認(仮)
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </>
  );
}
