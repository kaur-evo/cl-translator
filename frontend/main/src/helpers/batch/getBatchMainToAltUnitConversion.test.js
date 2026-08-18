import { getBatchMainToAltUnitConversion } from './getBatchMainToAltUnitConversion';

describe('mainToAltUnitConversion', () => {
  it('returns 1 if batch.unitConversion is missing', () => {
    expect(getBatchMainToAltUnitConversion({ mainToAltUnitConversion: 2 })).toBe(1);
  });

  it('returns 1 if batch.unitConversionType is missing', () => {
    expect(getBatchMainToAltUnitConversion({ mainToAltUnitConversion: 2 })).toBe(1);
  });

  it('returns 1 if batch object is empty', () => {
    expect(getBatchMainToAltUnitConversion({})).toBe(1);
  });

  it('returns the reciprocal of batch.unitConversion if batch.unitConversionType is PRIMARY_TO_ALT', () => {
    expect(getBatchMainToAltUnitConversion({ unitConversionType: 'PRIMARY_TO_ALT', unitConversion: 2 })).toBe(0.5);
  });

  it('returns batch.unitConversion if batch.unitConversionType is not PRIMARY_TO_ALT', () => {
    expect(getBatchMainToAltUnitConversion({ unitConversionType: 'ALT_TO_PRIMARY', unitConversion: 2 })).toBe(2);
  });
});
