'use client';

import type { ApprovalsNewFormTypes } from '@/features/approvals/new/schemas/approvals-new-schema';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage<ApprovalsNewFormTypes | null>(() => window.sessionStorage)
    : undefined;

export const approvalCreateAtom = atomWithStorage<ApprovalsNewFormTypes | null>('approvalCreate', null, storage, {
  getOnInit: true,
});
