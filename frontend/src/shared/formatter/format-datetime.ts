export const formatJapaneseDateTime = (value: string | null): string => {
  if (!value) return '-';

  const date = new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}年/${month}月/${day}日 ${hour}時${minute}分${second}秒`;
};
