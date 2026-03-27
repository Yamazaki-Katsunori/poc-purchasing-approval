import { describe, it, expect } from 'vitest';
import { assertNonNullable } from './asserts';
import { AppError } from '../error/appError';
import { APP_CODE } from '../app-code';

describe('assertNonNullable', () => {
  it('null の場合は AppError を throw する', () => {
    expect(() => assertNonNullable(null, APP_CODE.COMMON_UNEXPECTED)).toThrow(AppError);
  });

  it('undefined の場合も AppError を throw する', () => {
    expect(() => assertNonNullable(undefined, APP_CODE.COMMON_BAD_REQUEST)).toThrow(AppError);
  });

  it('値が存在する場合は throw しない', () => {
    expect(() => assertNonNullable('test', APP_CODE.COMMON_UNEXPECTED)).not.toThrow();
  });
});
