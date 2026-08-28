import { fireEvent, render } from '../../../utils/test-utils';
import GiftPage, { formatGiftValue } from '../../../../src/components/pages/gift-page';
import {
  getPriceData,
  getProductData,
  getSiteData,
} from '../../../../src/utils/fixtures-generator';

function buildSite() {
  const product = getProductData({
    id: 'tier_123',
    name: 'Premium',
    monthlyPrice: getPriceData({ amount: 500, interval: 'month' }),
    yearlyPrice: getPriceData({ amount: 5000, interval: 'year' }),
  });

  return getSiteData({
    products: [product],
    portalProducts: [product.id],
    portalDefaultPlan: 'monthly',
  });
}

function setup(site: ReturnType<typeof buildSite>) {
  return render(<GiftPage />, {
    overrideContext: {
      site,
      member: {
        email: 'buyer@example.com',
        status: 'free',
      },
    },
  });
}

// Fixed-duration gifting now lives on BetaGiftPage, which serves every site with
// giftSubCustomization enabled, so this page is only ever the cadence-only flow.
describe('GiftPage', () => {
  test('formatGiftValue renders JPY without dividing by 100', () => {
    // JPY(zero-decimal): 500 = ¥500。通貨を渡さないと isJPYCurrency がfalseになり
    // 500/100=5 の「¥5」と誤表示される。通貨を渡すよう修正済み。
    expect(formatGiftValue({ amount: 500, currency: 'JPY' })).toBe('¥500');
  });

  test('formatGiftValue renders decimal currency from cents', () => {
    expect(formatGiftValue({ amount: 500, currency: 'USD' })).toBe('$5');
    expect(formatGiftValue({ amount: 150000, currency: 'USD' })).toBe('$1,500');
  });

  test('preserves the cadence selector and cadence-only checkout', () => {
    const { getByRole, mockDoActionFn, queryByRole } = setup(buildSite());

    expect(getByRole('button', { name: '1 month' })).toBeInTheDocument();
    expect(getByRole('button', { name: '1 year' })).toBeInTheDocument();
    expect(queryByRole('button', { name: '3 months' })).not.toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Continue' }));

    expect(mockDoActionFn).toHaveBeenCalledWith('checkoutGift', {
      tierId: 'tier_123',
      cadence: 'month',
    });
  });
});
