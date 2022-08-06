import {getNonDecimal} from 'ghost-admin/utils/currency';
import {helper} from '@ember/component/helper';

export function ghPriceAmount(amount) {
    if (amount === '' || amount === null || amount === undefined) {
        return;
    }
    return getNonDecimal(amount, 'JPY');
}

// like {{pluralize}} but formats the number according to current locale
export default helper(function ([amount], options = {}) {
    return ghPriceAmount(amount, options);
});
