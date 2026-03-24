import { assertNonNullable } from '@/shared/guards/asserts';
import { ApprovalsNewFormTypes } from '../../new/schemas/approvals-new-schema';
import { APP_CODE } from '@/shared/app-code';

type AssertNewApprovalFormData = (value: ApprovalsNewFormTypes | null) => asserts value is ApprovalsNewFormTypes;

export const assertNewApprovalFormData: AssertNewApprovalFormData = (value) => {
  assertNonNullable(value, APP_CODE.APPROVAL_DRAFT_NOT_FOUND);
};
