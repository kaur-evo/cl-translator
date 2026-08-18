import { setActivePinia, createPinia } from 'pinia';

import { altUnitConversion, getUnitId, useAlternativeUnit } from './altUnitConversion';

import useUserPreferencesStore from '@/stores/userPreferences';

describe('Alternative unit conversion', () => {
  let batch;
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserPreferencesStore().viewSettings = { usePrimaryUnit: false };
    batch = { unitId: 'kg', alternativeUnitId: 'box' };
  });

  describe('useAlternativeUnit', () => {
    test('that useAlternativeUnit returns true when alternative unit is set and preferAltUnit is true even if usePrimaryUnit is true', () => {
      useUserPreferencesStore().viewSettings = { usePrimaryUnit: true };
      expect(useAlternativeUnit(batch, true)).toBe(true);
    });

    test('that useAlternativeUnit returns false when alternative unit is missing and preferAltUnit is true', () => {
      useUserPreferencesStore().viewSettings = { usePrimaryUnit: true };
      expect(useAlternativeUnit({ unitId: 'kg', alternativeUnitId: '' }, true)).toBe(false);
    });

    test('that useAlternativeUnit returns false when alternative unit is not preferred', () => {
      expect(useAlternativeUnit(batch, false)).toBe(false);
    });
  });

  test('that primary unit and quantity without conversion are returned', () => {
    useUserPreferencesStore().viewSettings = { usePrimaryUnit: true };
    expect(altUnitConversion(batch, 15)).toBe(15);
    expect(getUnitId(batch)).toBe('kg');
  });

  test('that alternative unit and quantity converted by 1 are returned', () => {
    const currentBatch = { ...batch };
    expect(altUnitConversion(currentBatch, 15)).toBe(15);
    expect(getUnitId(currentBatch)).toBe('box');
  });

  test('that alternative unit and quantity converted by 2 are returned', () => {
    const currentBatch = {
      ...batch,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    expect(altUnitConversion(currentBatch, 15)).toBe(30);
    expect(getUnitId(currentBatch)).toBe('box');
  });

  test('that alternative unit and quantity converted by 0.5 are returned', () => {
    const currentBatch = {
      ...batch,
      unitConversionType: 'PRIMARY_TO_ALT',
      unitConversion: 2,
    };
    expect(altUnitConversion(currentBatch, 15)).toBe(7.5);
    expect(getUnitId(currentBatch)).toBe('box');
  });

  test('that getUnitId returns alternative unit is set and, alternative unit is preferred and usePrimaryUnit is false', () => {
    expect(getUnitId(batch, true)).toBe('box');
  });

  test('that getUnitId returns primary unit when alternative unit is missing and, alternative unit is preferred and usePrimaryUnit is false', () => {
    expect(getUnitId({ unitId: 'kg', alternativeUnitId: '' }, true)).toBe('kg');
  });
});
