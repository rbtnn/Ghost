import { formatNumber, getCurrencySymbol, getStripeAmount } from './helpers';

interface GiftPrice {
  amount?: number | null;
  currency?: string | null;
}

export function formatGiftValue(price?: GiftPrice | null): string {
  const { amount, currency } = price ?? {};
  if (amount === null || amount === undefined || !currency) {
    return '';
  }
  // rbtnn: JPY(zero-decimal)は円の整数で保存されるため÷100しない。通貨を渡さないと
  // isJPYCurrency(undefined) が false になり ¥500 が ¥5 と誤表示される。
  return `${getCurrencySymbol(currency)}${formatNumber(getStripeAmount(amount, currency))}`;
}
