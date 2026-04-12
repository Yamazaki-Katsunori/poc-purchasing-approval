import { ApprovalDetail } from '@/features/approvals/detail/approval-detail';

type ApprovalDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: ApprovalDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <ApprovalDetail id={id} />
    </main>
  );
}
