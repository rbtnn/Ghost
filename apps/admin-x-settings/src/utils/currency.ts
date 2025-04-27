import {SelectOptionGroup} from '@tryghost/admin-x-design-system';

type CurrencyOption = {
    isoCode: string;
    name: string;
};

export const currencies: CurrencyOption[] = [
    {isoCode: 'USD', name: 'United States dollar'},
    {isoCode: 'JPY', name: 'Japanese Yen'}
];

export function currencyGroups() {
    return {
        top: currencies.slice(0, 5),
        other: currencies.slice(5)
    };
}

export function currencySelectGroups({showName = false} = {}): SelectOptionGroup[] {
    return Object.values(currencyGroups()).map((group, index) => ({
        label: '—',
        key: index.toString(),
        options: group.map(({isoCode,name}) => ({
            value: isoCode,
            label: showName ? `${isoCode} - ${name}` : isoCode
        }))
    }));
}

const nonDecCurrencies = [
    'JPY'
];

export function getSymbol(currency: string): string {
    if (!currency) {
        return '';
    }
    return Intl.NumberFormat('en', {currency, style: 'currency'}).format(0).replace(/[\d\s.]/g, '');
}

export function isNonCurrencies(currency: string) {
    return (-1 !== nonDecCurrencies.indexOf(currency.toUpperCase()));
}

export function currencyToDecimal(integerAmount: number, currency: string): number {
    if (isNonCurrencies(currency)) {
        return integerAmount;
    } else {
        return integerAmount / 100;
    }
}

export function currencyFromDecimal(decimalAmount: number, currency: string): number {
    if (isNonCurrencies(currency)) {
        return decimalAmount;
    } else {
        return decimalAmount * 100;
    }
}

/*
* Returns the minimum charge amount for a given currency,
* based on Stripe's requirements. Values here are double the Stripe limits, to take conversions to the settlement currency into account.
* @see https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
*/
export function minimumAmountForCurrency(currency: string) {
    const isoCurrency = currency?.toUpperCase();

    switch (isoCurrency) {
    case 'AED':
        return 4;
    case 'BGN':
        return 2;
    case 'CZK':
        return 30;
    case 'DKK':
        return 5;
    case 'HKD':
        return 8;
    case 'HUF':
        return 250;
    case 'JPY':
        return 100;
    case 'MXN':
        return 20;
    case 'MYR':
        return 4;
    case 'NOK':
        return 6;
    case 'PLN':
        return 4;
    case 'RON':
        return 4;
    case 'SEK':
        return 6;
    case 'THB':
        return 20;
    default:
        return 1;
    }
}

export function validateCurrencyAmount(
    cents: number | undefined,
    currency: string | undefined,
    {allowZero = true, maxAmount}: {allowZero?: boolean; maxAmount?: number} = {}
) {
    if (cents === undefined || !currency) {
        return;
    }

    const symbol = getSymbol(currency);
    const minAmount = minimumAmountForCurrency(currency);

    if (!allowZero && cents === 0) {
        return `Amount must be at least ${symbol}${minAmount}.`;
    }

    if (cents !== 0 && cents < (minAmount * ((currency || '') === 'JPY' ? 1 : 100))) {
        return `Non-zero amount must be at least ${symbol}${minAmount}.`;
    }

    if (maxAmount && cents !== 0 && cents > (maxAmount * ((currency || '') === 'JPY' ? 1 : 100))) {
        return `Suggested amount cannot be more than ${symbol}${maxAmount}.`;
    }
}
