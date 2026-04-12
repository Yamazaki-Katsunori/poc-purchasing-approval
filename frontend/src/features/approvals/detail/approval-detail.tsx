'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui';
import { DetailRow } from './componetns/detailRow';

export function ApprovalDetail() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>購買新規申請確認</CardTitle>
        </CardHeader>

        <CardContent>
          <DetailRow label="タイトル" value="StbTitle" />
          <DetailRow label="購買種別" value="StbPurchaseType" />
          <DetailRow label="購入金額" value="1234" />
          <DetailRow label="申請理由" value="StbReason" multiline />
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
