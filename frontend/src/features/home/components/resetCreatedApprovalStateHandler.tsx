'use client';

import { useResetCreateAtom } from '../hooks/use-reset-create-approval-atom';

export function ResetCreatedApprovalStateHandler() {
  useResetCreateAtom();

  return null;
}
