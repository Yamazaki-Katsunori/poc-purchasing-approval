/**
 * TODO:
 * 申請画面で何らかのエラーでリダイレクトを行う際に識別させる定数群
 **/
export const APPROVAL_REDIRECT_ERRORS = {
  MISSING_FORM_DATA: 'missing-form-data',
} as const;

/**
 * TODO:
 * 申請画面で何らかのエラー時にToastで通知したい場合
 * 対象のToastに付与するIDを定義する定数群
 *
 **/
export const APPROVAL_TOAST_IDS = {
  MISSING_FORM_DATA: 'missing-form-data',
} as const;
