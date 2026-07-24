import {formatNumber} from './format-number';
import {helper} from '@ember/component/helper';

const IsJPYCurrency = (currency) => {
    if (currency !== null && typeof currency.toUpperCase === 'function') {
        return currency.toUpperCase() === 'JPY';
    } else {
        return true;
    }
};

export function ghPriceAmount(amount, currency, {cents = true} = {}) {
    if (amount) {
        if (IsJPYCurrency(currency)) {
            return formatNumber(amount);
        } else {
            let price = cents ? amount / 100 : Math.round(amount / 100);
            if (price % 1 === 0) {
                return formatNumber(price);
            } else {
                return formatNumber(Math.round(price * 100) / 100, {minimumFractionDigits: 2});
            }
        }
    }
    return 0;
}

// like {{pluralize}} but formats the number according to current locale
export default helper(function ([amount], options = {}) {
    return ghPriceAmount(amount, 'JPY', options);
});
