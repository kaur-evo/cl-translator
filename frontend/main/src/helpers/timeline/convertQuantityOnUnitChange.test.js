import { convertQuantityOnUnitChange } from './convertQuantityOnUnitChange';

describe('convertQuantityOnUnitChange', () => {
  const batch = {
    unitId: 'pcs',
    alternativeUnitId: 'kg',
    unitConversion: 2,
    unitConversionType: 'ALT_TO_PRIMARY',
  };

  it('returns original quantity when currentQty is 0', () => {
    expect(convertQuantityOnUnitChange(0, 'pcs', 'kg', batch)).toBe(0);
  });

  it('returns original quantity when currentQty is null', () => {
    expect(convertQuantityOnUnitChange(null, 'pcs', 'kg', batch)).toBe(null);
  });

  it('returns original quantity when unit ids are the same', () => {
    expect(convertQuantityOnUnitChange(100, 'pcs', 'pcs', batch)).toBe(100);
  });

  it('returns multiplied quantity when changing from main to alternative unit', () => {
    const result = convertQuantityOnUnitChange(100, 'pcs', 'kg', batch);
    expect(result).toBe(200);
  });

  it('returns divided quantity when changing from alternative to main unit', () => {
    const result = convertQuantityOnUnitChange(200, 'kg', 'pcs', batch);
    expect(result).toBe(100);
  });

  it('returns correct quantity when handling decimal values', () => {
    const result = convertQuantityOnUnitChange(50.5, 'pcs', 'kg', batch);
    expect(result).toBe(101);
  });

  it('returns original quantity when handling batch without alternative unit', () => {
    const batchWithoutAlt = {
      unitId: 'pcs',
      alternativeUnitId: null,
      unitConversion: null,
    };
    const result = convertQuantityOnUnitChange(100, 'pcs', null, batchWithoutAlt);
    expect(result).toBe(100);
  });

  it('returns original quantity when unitConversion is not provided', () => {
    const batchNoConversion = {
      unitId: 'pcs',
      alternativeUnitId: 'box',
      unitConversion: undefined,
    };
    const result = convertQuantityOnUnitChange(100, 'pcs', 'box', batchNoConversion);
    expect(result).toBe(100);
  });

  it('returns correct quantity when handling PRIMARY_TO_ALT conversion type', () => {
    const batchPrimaryToAlt = {
      unitId: 'pcs',
      alternativeUnitId: 'kg',
      unitConversion: 2,
      unitConversionType: 'PRIMARY_TO_ALT',
    };
    const result = convertQuantityOnUnitChange(100, 'pcs', 'kg', batchPrimaryToAlt);
    expect(result).toBe(50);
  });

  it('returns rounded quantity when division produces repeating decimals', () => {
    const batchWithFraction = {
      unitId: 'pcs',
      alternativeUnitId: 'kg',
      unitConversion: 3,
      unitConversionType: 'ALT_TO_PRIMARY',
    };
    const result = convertQuantityOnUnitChange(10, 'kg', 'pcs', batchWithFraction);
    expect(result).toBe(3.33);
  });

  it('returns rounded quantity when multiplication produces long decimals', () => {
    const batchWithFraction = {
      unitId: 'pcs',
      alternativeUnitId: 'kg',
      unitConversion: 7,
      unitConversionType: 'ALT_TO_PRIMARY',
    };
    const result = convertQuantityOnUnitChange(1.234, 'pcs', 'kg', batchWithFraction);
    expect(result).toBe(8.64);
  });
});
