'use client';

import type { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage<CreateApprovalRequestTypes | null>(() => window.sessionStorage)
    : undefined;

export const approvalCreateAtom = atomWithStorage<CreateApprovalRequestTypes | null>('approvalCreate', null, storage, {
  getOnInit: true,
});
