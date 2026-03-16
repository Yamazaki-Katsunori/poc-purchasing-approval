import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// テストの書き方例
describe('数値のテスト', () => {
  beforeAll(() => {
    // describe で囲った全てのテストケース(it)の実行前に実行される共通処理
    console.log('テスト開始前の初期化で利用');
  });

  afterAll(() => {
    // describe で囲った全てのテストケース(it)の実行後に実行される共通処理
    console.log('テスト完了後の後片付けで利用');
  });

  // 実際のテストケースの定義
  it('数値の等価性テスト', () => {
    expect(2 + 2).toBe(4);
  });

  it('数値の不等価性テスト', () => {
    expect(2 + 2).not.toBe(5);
  });
});
