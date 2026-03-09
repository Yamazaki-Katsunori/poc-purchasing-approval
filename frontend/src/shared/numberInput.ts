export const toHalfWidthNumber = (value: string) => {
  return value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
};

export const normalizeNumberInput = (value: string) => {
  const half = toHalfWidthNumber(value);
  return half.replace(/[^\d]/g, '');
};

export const formatNumberWithComma = (value: string) => {
  if (!value) return '';
  return new Intl.NumberFormat('ja-JP').format(Number(value));
};
