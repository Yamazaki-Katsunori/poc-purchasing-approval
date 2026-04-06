'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui';
import Link from 'next/link';
import { useApprovalsQuery } from './hooks/use-approvals-query';
import { PageLoading } from '@/shared/components/page-loading';
import { ApprovalListItemTypes } from './schemas/approvals-list-response-schema';

export function List() {
  const { data, error, isError, isPending } = useApprovalsQuery();

  const items = data?.items;

  if (isPending) return <PageLoading message="データ取得中..." />;

  if (isError) return <div>{error.message}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>申請番号</TableHead>
          <TableHead>件名</TableHead>
          <TableHead>申請者</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>申請日時</TableHead>
          <TableHead>作成日時</TableHead>
          <TableHead>承認日時</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items?.map((item: ApprovalListItemTypes) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                key={item.id}
                href={`/approvals/:${item.id}`}
                className="font-medium text-blue-600 underline-offset-2 hover:underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {item.id}
              </Link>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.approval_user}</TableCell>
            <TableCell>{item.approval_status}</TableCell>
            <TableCell>{item.requested_at ?? null}</TableCell>
            <TableCell>{item.created_at}</TableCell>
            <TableCell>{item.approved_at ?? null}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
