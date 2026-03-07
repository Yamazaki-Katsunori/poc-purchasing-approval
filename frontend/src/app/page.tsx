import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui';

// demo data
type ApprovalItem = {
  id: number;
  requestNo: string;
  title: string;
  applicantName: string;
  status: string;
};

const items: ApprovalItem[] = [
  {
    id: 1,
    requestNo: 'APP-001',
    title: 'PC購入申請',
    applicantName: '山田 太郎',
    status: '申請中',
  },
  {
    id: 2,
    requestNo: 'APP-002',
    title: 'モニター購入申請',
    applicantName: '佐藤 花子',
    status: '承認済み',
  },
];

export default function Page() {
  return (
    <main>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>申請番号</TableHead>
            <TableHead>件名</TableHead>
            <TableHead>申請者</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item: ApprovalItem) => (
            <TableRow key={item.id}>
              <TableCell>{item.requestNo}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.applicantName}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
