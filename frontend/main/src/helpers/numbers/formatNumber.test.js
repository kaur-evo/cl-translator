import { setActivePinia, createPinia } from 'pinia';

import { formatNumber, formatPercentage } from './formatNumber';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('formatNumber', () => {
  describe('unit formatting in different locales', () => {
    const units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'liter', 'newton', 'electronvolt'];
    const number = 1234567890;
    units.forEach((unit) => {
      test(`if unit returns expected snapshot with  unit ${unit}`, () => {
        expect(formatNumber(number, null, { style: 'unit', unit })).toMatchSnapshot();
      });
    });
  });
});

describe('formatPercentage', () => {
  it('returns number with 2 decimals by default', () => {
    expect(formatPercentage(12.123123)).toBe('12,12%');
    expect(formatPercentage(12.125123)).toBe('12,13%');
  });

  it('returns number with 1 decimal when option is set', () => {
    expect(formatPercentage(12.123123, { decimalPlaces: 2, pctDecimalPlaces: 1 })).toBe('12,1%');
    expect(formatPercentage(12.555123, { decimalPlaces: 2, pctDecimalPlaces: 1 })).toBe('12,6%');
  });

  it('keeps decimal places only if option set', () => {
    expect(formatPercentage(12.1001, { decimalPlaces: 2, pctDecimalPlaces: 2, keepDecimalPlaces: true })).toBe('12,10%');
    expect(formatPercentage(12.1001, { decimalPlaces: 2, pctDecimalPlaces: 2, keepDecimalPlaces: false })).toBe('12,1%');
  });
});
