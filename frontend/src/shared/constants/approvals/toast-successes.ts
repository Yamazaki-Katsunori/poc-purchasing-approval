/**
 * TODO:
 * 申請画面各種で何らかのToast通知時に
 * 対象のToastに付与するIDを定義する定数群
 *
 **/
export const APPROVAL_TOAST_IDS = {
  MISSING_FORM_DATA: 'missing-form-data',
  CREATED_APPROVAL_SUCCESS: 'created-approval-success',
  CREATED_APPROVAL_FAILED: 'created-approval-failed',
} as const;
