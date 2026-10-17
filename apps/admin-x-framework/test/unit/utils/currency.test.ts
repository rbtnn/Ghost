import { getSymbol, validateCurrencyAmount } from '../../../src/utils/currency';

describe('currency utils', () => {
  describe('getSymbol', () => {
    it('returns correct symbols for common currencies', () => {
      expect(getSymbol('USD')).toBe('$');
      expect(getSymbol('EUR')).toBe('€');
      expect(getSymbol('GBP')).toBe('£');
      expect(getSymbol('JPY')).toBe('¥');
      expect(getSymbol('CNY')).toBe('CN¥');
      expect(getSymbol('AUD')).toBe('A$');
      expect(getSymbol('CAD')).toBe('CA$');
      expect(getSymbol('CHF')).toBe('CHF');
      expect(getSymbol('SEK')).toBe('SEK');
      expect(getSymbol('NZD')).toBe('NZ$');
    });

    it('returns empty string for empty input', () => {
      expect(getSymbol('')).toBe('');
    });

    it('returns empty string for null/undefined input', () => {
      expect(getSymbol(null as any)).toBe('');
      expect(getSymbol(undefined as any)).toBe('');
    });

    it('handles uncommon but valid currency codes', () => {
      expect(getSymbol('INR')).toBe('₹');
      expect(getSymbol('RUB')).toBe('RUB');
      expect(getSymbol('BRL')).toBe('R$');
      expect(getSymbol('ZAR')).toBe('ZAR');
      expect(getSymbol('MXN')).toBe('MX$');
      expect(getSymbol('SGD')).toBe('SGD');
      expect(getSymbol('HKD')).toBe('HK$');
      expect(getSymbol('NOK')).toBe('NOK');
      expect(getSymbol('KRW')).toBe('₩');
      expect(getSymbol('TRY')).toBe('TRY');
    });

    it('returns generic currency symbol for invalid/unknown currency codes', () => {
      expect(getSymbol('XXX')).toBe('¤');
      expect(() => getSymbol('INVALID')).toThrow('Invalid currency code');
      expect(() => getSymbol('123')).toThrow('Invalid currency code');
    });

    it('handles lowercase currency codes', () => {
      expect(getSymbol('usd')).toBe('$');
      expect(getSymbol('eur')).toBe('€');
      expect(getSymbol('gbp')).toBe('£');
    });

    it('throws error for invalid currency codes with special characters', () => {
      expect(() => getSymbol('US$')).toThrow('Invalid currency code');
      expect(() => getSymbol('€UR')).toThrow('Invalid currency code');
    });

    it('removes numbers and decimal points from formatted output', () => {
      const result = getSymbol('USD');
      expect(result).not.toMatch(/\d/);
      expect(result).not.toContain('.');
      expect(result).not.toContain('0');
    });

    it('throws error for currency codes with spaces', () => {
      expect(() => getSymbol(' USD ')).toThrow('Invalid currency code');
      expect(() => getSymbol('U SD')).toThrow('Invalid currency code');
    });
  });

  describe('validateCurrencyAmount', () => {
    it('allows JPY amount >= minimum (100) without dividing by 100', () => {
      // JPYはゼロ小数点: ¥500 = 500 として保存される。500 < 100*100 と誤判定されないこと
      expect(validateCurrencyAmount(500, 'JPY')).toBeUndefined();
      expect(validateCurrencyAmount(100, 'JPY')).toBeUndefined();
    });

    it('rejects JPY amount below minimum', () => {
      expect(validateCurrencyAmount(99, 'JPY')).toBe('Non-zero amount must be at least ¥100.');
      expect(validateCurrencyAmount(0, 'JPY', { allowZero: false })).toBe('Amount must be at least ¥100.');
    });

    it('enforces maxAmount for JPY without x100', () => {
      expect(validateCurrencyAmount(5000, 'JPY', { maxAmount: 1000 })).toBe('Suggested amount cannot be more than ¥1000.');
      expect(validateCurrencyAmount(500, 'JPY', { maxAmount: 1000 })).toBeUndefined();
    });

    it('uses cents (x100) for decimal currencies', () => {
      // USD: $5 = 500 cents, min $1 = 100 cents
      expect(validateCurrencyAmount(500, 'USD')).toBeUndefined();
      expect(validateCurrencyAmount(99, 'USD')).toBe('Non-zero amount must be at least $1.');
      expect(validateCurrencyAmount(500, 'USD', { maxAmount: 3 })).toBe('Suggested amount cannot be more than $3.');
    });
  });
});
