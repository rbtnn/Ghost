export const currencies = [
    {isoCode: 'USD', name: 'United States dollar'},
    {isoCode: 'JPY', name: 'Japanese Yen'}
];

const IsJPYCurrency = (currency) => {
    if (currency !== null && typeof currency.toUpperCase === 'function') {
        return currency.toUpperCase() === 'JPY';
    } else {
        return true;
    }
};

export function getSymbol(currency) {
    if (!currency) {
        return '';
    }
    return Intl.NumberFormat('en', {currency, style: 'currency'}).format(0).replace(/[\d\s.]/g, '');
}

export function getNonDecimal(amount, currency) {
    if (IsJPYCurrency(currency)) {
        return amount;
    } else {
        return amount / 100;
    }
}

export function getCurrencyOptions() {
    const noOfTopCurrencies = 5;

    const topCurrencies = currencies.slice(0, noOfTopCurrencies).map((currency) => {
        return {
            value: currency.isoCode.toLowerCase(),
            label: `${currency.isoCode} - ${currency.name}`,
            isoCode: currency.isoCode
        };
    });

    const otherCurrencies = currencies.slice(noOfTopCurrencies, currencies.length).map((currency) => {
        return {
            value: currency.isoCode.toLowerCase(),
            label: `${currency.isoCode} - ${currency.name}`,
            isoCode: currency.isoCode
        };
    });

    return [
        {
            groupName: '—',
            options: topCurrencies
        },
        {
            groupName: '—',
            options: otherCurrencies
        }
    ];
}

/*
* Returns the minimum charge amount for a given currency,
* based on Stripe's requirements. Values here are double the Stripe limits, to take conversions to the settlement currency into account.
* @see https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
* @param {String} currency — Currency in the 3-letter ISO format (e.g. "USD", "EUR")
* @returns {Number} — Minimum amount
*/
export function minimumAmountForCurrency(currency) {
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
