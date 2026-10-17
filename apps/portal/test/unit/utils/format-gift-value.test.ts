import { formatGiftValue } from '../../../src/utils/format-gift-value';

describe('formatGiftValue', () => {
  it('renders JPY without dividing by 100', () => {
    // JPY(zero-decimal): 500 = ¥500。通貨を渡さないと isJPYCurrency(undefined) が
    // false になり 500/100=5 の「¥5」と誤表示される。通貨を渡すよう修正済み。
    expect(formatGiftValue({ amount: 500, currency: 'JPY' })).toBe('¥500');
  });

  it('renders decimal currencies from cents', () => {
    expect(formatGiftValue({ amount: 500, currency: 'USD' })).toBe('$5');
    expect(formatGiftValue({ amount: 150000, currency: 'USD' })).toBe('$1,500');
  });

  it('returns empty for missing amount/currency', () => {
    expect(formatGiftValue(null)).toBe('');
    expect(formatGiftValue({})).toBe('');
  });
});
