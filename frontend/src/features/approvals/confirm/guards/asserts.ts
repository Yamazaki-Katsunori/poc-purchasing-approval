import { assertNonNullable } from '@/shared/guards/asserts';
import { CreateApprovalRequestTypes } from '@/features/approvals/schemas/approvals-new-schema';
import { APP_CODE } from '@/shared/app-code';

type AssertCreateApprovalRequestData = (
  value: CreateApprovalRequestTypes | null,
) => asserts value is CreateApprovalRequestTypes;

export const assertCreateApprovalRequestData: AssertCreateApprovalRequestData = (value) => {
  assertNonNullable(value, APP_CODE.APPROVAL_DRAFT_NOT_FOUND);
};
