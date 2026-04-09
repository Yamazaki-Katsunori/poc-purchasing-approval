import { describe, expect, it } from 'vitest';
import { formatJapaneseDateTime } from './format-datetime';

describe(`formatJapaneseDateTime`, () => {
  it(`valueがnullの場合 - を返す`, () => {
    expect(formatJapaneseDateTime(null)).toBe('-');
  });

  it(`valueが日付の文字列の場合 日本の時刻表示形式を返す`, () => {
    const testDateValue = new Date('1993-03-30T12:59:59Z').toString();

    expect(formatJapaneseDateTime(testDateValue)).toBe(`1993年/3月/30日 12時59分59秒`);
  });
});
