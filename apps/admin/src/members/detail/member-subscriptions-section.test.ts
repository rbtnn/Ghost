import {formatPriceBlockAmount} from './member-subscriptions-section';

describe('formatPriceBlockAmount', () => {
    it('formats zero-decimal currencies (e.g. JPY) without dividing by 100', () => {
        // 500 JPY is 500 yen (no minor unit), not 5.
        expect(formatPriceBlockAmount(500, 'jpy')).toBe('500');
        expect(formatPriceBlockAmount(0, 'jpy')).toBe('0');
    });

    it('divides fractional currencies by 100', () => {
        expect(formatPriceBlockAmount(500, 'usd')).toBe('5');
        expect(formatPriceBlockAmount(499, 'usd')).toBe('4.99');
    });
});
