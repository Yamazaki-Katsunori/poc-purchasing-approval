import { describe, expect, it } from 'vitest';
import { formatNumberWithComma, normalizeNumberInput } from '@/shared/numberInput';

describe('normalizeNumberInput', () => {
  it('カンマを除去する', () => {
    expect(normalizeNumberInput('1,234')).toBe('1234');
  });

  it('数値以外が混ざっていても入力整形できる', () => {
    expect(normalizeNumberInput('12a3,4')).toBe('1234');
  });

  it('空文字は空文字のまま返す', () => {
    expect(normalizeNumberInput('')).toBe('');
  });
});

describe('formatNumberWithComma', () => {
  it('3桁区切りでカンマを付与する', () => {
    expect(formatNumberWithComma('1234')).toBe('1,234');
  });

  it('6桁以上も3桁区切りで整形する', () => {
    expect(formatNumberWithComma('1234567')).toBe('1,234,567');
  });

  it('空文字は空文字のまま返す', () => {
    expect(formatNumberWithComma('')).toBe('');
  });
});
