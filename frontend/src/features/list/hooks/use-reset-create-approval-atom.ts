'use client';

import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useSetAtom } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const useResetCreateAtom = () => {
  const setApprovalAtom = useSetAtom(approvalCreateAtom);
  const searchParams = useSearchParams();
  const router = useRouter();

  const created = searchParams.get('created');

  useEffect(() => {
    if (created !== 'true') return;

    setApprovalAtom(null);
    router.replace('/');
  }, [setApprovalAtom, created, router]);
};
