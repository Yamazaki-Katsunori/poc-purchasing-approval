'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui';
import Link from 'next/link';
import { useApprovalsQuery } from './hooks/use-approvals-query';
import { PageLoading } from '@/shared/components/page-loading';
import { ApprovalListItemTypes } from './schemas/approvals-list-response-schema';
import { formatJapaneseDateTime } from '@/shared/formatter/format-datetime';

export function List() {
  const { data, error, isError, isPending } = useApprovalsQuery();

  const items = data?.items;

  if (isPending) return <PageLoading message="データ取得中..." />;

  if (isError)
    return (
      <div>
        <p className="text-red-500">申請データの取得に失敗しました</p>
        <p className="text-red-500">{`詳細: ${error.message}`}</p>
      </div>
    );

  return (
    <Table className="min-w-295">
      <TableHeader>
        <TableRow className="">
          <TableHead className="w-auto text-center">申請番号</TableHead>
          <TableHead className="min-w-auto text-center">件名</TableHead>
          <TableHead className="w-auto text-center">申請者</TableHead>
          <TableHead className="w-auto text-center">ステータス</TableHead>
          <TableHead className="w-auto text-center whitespace-nowrap">申請日時</TableHead>
          <TableHead className="w-auto text-center whitespace-nowrap">作成日時</TableHead>
          <TableHead className="w-auto text-center whitespace-nowrap">承認日時</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items?.map((item: ApprovalListItemTypes) => (
          <TableRow key={item.id}>
            <TableCell className="text-center">
              <Link
                key={item.id}
                href={`/approvals/:${item.id}`}
                className="font-medium text-blue-600 underline-offset-2 hover:underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {item.id}
              </Link>
            </TableCell>
            <TableCell className="text-center">{item.title}</TableCell>
            <TableCell className="text-center">{item.approval_user}</TableCell>
            <TableCell className="text-center">{item.approval_status}</TableCell>
            <TableCell className="text-center">{formatJapaneseDateTime(item.requested_at ?? null)}</TableCell>
            <TableCell className="text-center">{formatJapaneseDateTime(item.created_at)}</TableCell>
            <TableCell className="text-center">{formatJapaneseDateTime(item.approved_at ?? null)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
