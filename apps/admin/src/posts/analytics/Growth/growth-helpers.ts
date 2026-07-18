export const centsToDollars = (value : number) => {
    const IsJPYCurrency = () => { return true; };
    return Math.round(value / (IsJPYCurrency() ? 1 : 100));
};
