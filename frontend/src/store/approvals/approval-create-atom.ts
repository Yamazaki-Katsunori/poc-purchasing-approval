import { atom } from 'jotai';
import type { ApprovalsNewFormTypes } from '@/features/approvals/new/schemas/approvals-new-schema';

export const approvalCreateAtom = atom<ApprovalsNewFormTypes | null>(null);
