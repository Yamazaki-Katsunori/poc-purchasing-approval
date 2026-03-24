export const APP_CODE = {
  COMMON_UNEXPECTED: {
    code: 'COMMON_UNEXPECTED',
    defaultMessage: '予期しないエラーが発生しました',
    defaultStatus: 500,
  },
  COMMON_BAD_REQUEST: {
    code: 'COMMON_BAD_REQUEST',
    defaultMessage: '不正なリクエストです',
    defaultStatus: 400,
  },
  COMMON_UNAUTHORIZED: {
    code: 'COMMON_UNAUTHORIZED',
    defaultMessage: '認証が必要です',
    defaultStatus: 401,
  },
  COMMON_FORBIDDEN: {
    code: 'COMMON_FORBIDDEN',
    defaultMessage: 'この操作は許可されていません',
    defaultStatus: 403,
  },
  COMMON_NOT_FOUND: {
    code: 'COMMON_NOT_FOUND',
    defaultMessage: '対象データが見つかりません',
    defaultStatus: 404,
  },

  APPROVAL_DRAFT_NOT_FOUND: {
    code: 'APPROVAL_DRAFT_NOT_FOUND',
    defaultMessage: '申請データが存在しません',
    defaultStatus: 400,
  },
  APPROVAL_CREATE_FAILED: {
    code: 'APPROVAL_CREATE_FAILED',
    defaultMessage: '申請の登録に失敗しました',
    defaultStatus: 500,
  },
} as const;

export type AppCodeMap = typeof APP_CODE;
export type AppCodeKey = keyof AppCodeMap;
export type AppCodeValue = AppCodeMap[AppCodeKey];
export type AppCode = AppCodeValue['code'];
