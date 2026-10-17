import { useEffect, useRef, useState } from 'react';

const stripNonNumeric = (input: string) => input.replace(/[^\d.]+/g, '');

const useCurrencyInput = (valueInCents: number | '', onChange?: (cents: number) => void, currency?: string) => {
  const divisor = currency?.toUpperCase() === 'JPY' ? 1 : 100;
  const forceCurrencyValue = (input: string) => {
    return Math.round(parseFloat(input.match(/[\d]+\.?[\d]{0,2}/)?.[0] || '0') * divisor);
  };

  const [value, setValue] = useState(
    valueInCents === '' ? '' : ((valueInCents || 0) / divisor).toString(),
  );
  const lastEmittedValue = useRef<number | ''>(valueInCents);

  useEffect(() => {
    if (!Object.is(valueInCents, lastEmittedValue.current)) {
      setValue(valueInCents === '' ? '' : ((valueInCents || 0) / divisor).toString());
    }

    lastEmittedValue.current = valueInCents;
  }, [valueInCents]);

  return {
    value,
    onBlur: () => setValue((forceCurrencyValue(value) / divisor).toString()),
    onChange: (input: string) => {
      const cents = forceCurrencyValue(input);

      setValue(stripNonNumeric(input));
      lastEmittedValue.current = cents;
      onChange?.(cents);
    },
  };
};

export default useCurrencyInput;
