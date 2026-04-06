import { ResetCreatedApprovalStateHandler } from '@/features/list/components/resetCreatedApprovalStateHandler';
import { List } from '@/features/list/list';

export default function Page() {
  return (
    <main>
      <ResetCreatedApprovalStateHandler />
      <List />
    </main>
  );
}
