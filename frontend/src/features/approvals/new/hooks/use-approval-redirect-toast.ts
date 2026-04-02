'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { APPROVAL_REDIRECT_ERRORS, APPROVAL_TOAST_IDS } from '@/shared/constants/approvals/redirect-errors';

export function useApprovalRedirectToast() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error !== APPROVAL_REDIRECT_ERRORS.MISSING_FORM_DATA) return;

    toast.error('入力項目を入力してください', {
      id: APPROVAL_TOAST_IDS.MISSING_FORM_DATA,
    });

    router.replace('/approvals/new');
  }, [router, searchParams]);
}
