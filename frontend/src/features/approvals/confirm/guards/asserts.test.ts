import { describe, it, expect } from 'vitest';
import { assertCreateApprovalRequestData } from './asserts';
import { APP_CODE } from '@/shared/app-code';
import { AppError } from '@/shared/error/appError';

describe('assertCreateApprovalRequestData', () => {
  const validData = {
    title: 'テスト',
    purchase_type: 'test_type',
    amount: '1000',
    reason: 'テスト理由',
  } as const;

  it('値が存在する場合は throw しない', () => {
    expect(() => assertCreateApprovalRequestData(validData)).not.toThrow();
  });

  it('null の場合は AppError を throw する', () => {
    expect(() => assertCreateApprovalRequestData(null)).toThrow(AppError);

    // さらに appCode も確認したい場合
    try {
      assertCreateApprovalRequestData(null);
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe(APP_CODE.APPROVAL_DRAFT_NOT_FOUND.code);
    }
  });
});
