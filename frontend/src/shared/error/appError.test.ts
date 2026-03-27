import { describe, it, expect } from 'vitest';
import { AppError } from './appError';
import { APP_CODE } from '../app-code';

describe('AppError', () => {
  it('基本的に AppCode の値をプロパティに設定できる', () => {
    const error = new AppError(APP_CODE.COMMON_UNEXPECTED);

    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe(APP_CODE.COMMON_UNEXPECTED.code);
    expect(error.status).toBe(APP_CODE.COMMON_UNEXPECTED.defaultStatus);
    expect(error.message).toBe(APP_CODE.COMMON_UNEXPECTED.defaultMessage);
    expect(error.cause).toBeUndefined();
  });

  it('オプションで message, status, cause を上書きできる', () => {
    const customMessage = 'カスタムエラー';
    const customStatus = 999;
    const customCause = new Error('cause error');

    const error = new AppError(APP_CODE.COMMON_BAD_REQUEST, {
      message: customMessage,
      status: customStatus,
      cause: customCause,
    });

    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(customStatus);
    expect(error.cause).toBe(customCause);
  });
});
