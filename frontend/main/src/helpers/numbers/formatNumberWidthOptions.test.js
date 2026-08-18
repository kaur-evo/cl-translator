import formatNumberWithOptions from './formatNumberWithOptions';

describe('formatNumberWithOptions', () => {
  test('with "," as decimal separator and " " as groupSeparator', () => {
    expect(formatNumberWithOptions(123454234, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: ' ' })).toEqual('123 454 234');
    expect(formatNumberWithOptions(123454234.123, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: ' ' })).toEqual('123 454 234,1');
    expect(formatNumberWithOptions(123454234.567, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: ' ' })).toEqual('123 454 234,6');
    expect(formatNumberWithOptions(123454234.567, { decimalPlaces: 5, decimalSeparator: ',', groupSeparator: ' ' })).toEqual('123 454 234,567');
    expect(formatNumberWithOptions(123454234.567, { decimalPlaces: 0, decimalSeparator: ',', groupSeparator: ' ' })).toEqual('123 454 235');
  });

  test('with "," as decimal separator and "." as groupSeparator', () => {
    expect(formatNumberWithOptions(5123454234, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: '.' })).toEqual('5.123.454.234');
    expect(formatNumberWithOptions(5123454234.123, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: '.' })).toEqual('5.123.454.234,1');
    expect(formatNumberWithOptions(5123454234.567, { decimalPlaces: 1, decimalSeparator: ',', groupSeparator: '.' })).toEqual('5.123.454.234,6');
    expect(formatNumberWithOptions(5123454234.567, { decimalPlaces: 5, decimalSeparator: ',', groupSeparator: '.' })).toEqual('5.123.454.234,567');
  });

  test('with "." as decimal separator and "," as groupSeparator', () => {
    expect(formatNumberWithOptions(23454234, { decimalPlaces: 1, decimalSeparator: '.', groupSeparator: ',' })).toEqual('23,454,234');
    expect(formatNumberWithOptions(23454234.123, { decimalPlaces: 1, decimalSeparator: '.', groupSeparator: ',' })).toEqual('23,454,234.1');
    expect(formatNumberWithOptions(23454234.567, { decimalPlaces: 1, decimalSeparator: '.', groupSeparator: ',' })).toEqual('23,454,234.6');
    expect(formatNumberWithOptions(23454234.567, { decimalPlaces: 5, decimalSeparator: '.', groupSeparator: ',' })).toEqual('23,454,234.567');
    expect(formatNumberWithOptions(23454234.567123, { decimalPlaces: null, decimalSeparator: '.', groupSeparator: ',' })).toEqual('23,454,234.56712');
  });

  test('keeping decimal places', () => {
    expect(formatNumberWithOptions(1.50000, { decimalPlaces: 5, decimalSeparator: '.', groupSeparator: ',' }, { style: 'unit', unit: 'second' })).toEqual('1.5 sec');
    expect(formatNumberWithOptions(1.50000, {
      decimalPlaces: 5, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('1.50000 sec');
    expect(formatNumberWithOptions(1.50000, {
      decimalPlaces: 2, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('1.50 sec');
    expect(formatNumberWithOptions(1.500000000, {
      decimalPlaces: 5, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('1.50000 sec');
    expect(formatNumberWithOptions(1, {
      decimalPlaces: 5, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('1.00000 sec');
    expect(formatNumberWithOptions(1, {
      decimalPlaces: 2, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('1.00 sec');
    expect(formatNumberWithOptions(0.02, {
      decimalPlaces: 0, decimalSeparator: '.', groupSeparator: ',', keepDecimalPlaces: true,
    }, { style: 'unit', unit: 'second' })).toEqual('0 sec');
  });

  test('that number is rounded, if decimal places is 0', () => {
    expect(formatNumberWithOptions(5.6, { decimalPlaces: 0, decimalSeparator: '.' })).toEqual('6');
    expect(formatNumberWithOptions(5.61, { decimalPlaces: 0, decimalSeparator: '.' })).toEqual('6');
    expect(formatNumberWithOptions(5.612, { decimalPlaces: 0, decimalSeparator: '.' })).toEqual('6');
  });

  test('that number is not rounded, if decimal places is null', () => {
    expect(formatNumberWithOptions(5.6, { decimalPlaces: null, decimalSeparator: '.' })).toEqual('5.6');
    expect(formatNumberWithOptions(5.61, { decimalPlaces: null, decimalSeparator: '.' })).toEqual('5.61');
    expect(formatNumberWithOptions(5.612, { decimalPlaces: null, decimalSeparator: '.' })).toEqual('5.612');
  });
});
