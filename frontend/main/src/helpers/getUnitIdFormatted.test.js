import { describe, it, expect } from 'vitest';

import getUnitIdFormatted from './getUnitIdFormatted';

import runtimeType from '@/constants/runtimeType';
import i18n from '@/services/i18n';

describe('getUnitIdFormatted', () => {
  it('should format SECOND_PER_UNIT correctly', () => {
    const type = runtimeType.SECOND_PER_UNIT;
    const unitId = 'testUnit';
    const result = getUnitIdFormatted(type, unitId);
    expect(result).toBe(i18n.global.t('SECOND_PER_{unit}', { unit: unitId }));
  });

  it('should format UNIT_PER_SECOND correctly', () => {
    const type = runtimeType.UNIT_PER_SECOND;
    const unitId = 'testUnit';
    const result = getUnitIdFormatted(type, unitId);
    expect(result).toBe(i18n.global.t('{unit}_PER_SECOND', { unit: unitId }));
  });

  it('should format UNIT_PER_MINUTE correctly', () => {
    const type = runtimeType.UNIT_PER_MINUTE;
    const unitId = 'testUnit';
    const result = getUnitIdFormatted(type, unitId);
    expect(result).toBe(i18n.global.t('{unit}_PER_MINUTE', { unit: unitId }));
  });

  it('should format UNIT_PER_HOUR correctly', () => {
    const type = runtimeType.UNIT_PER_HOUR;
    const unitId = 'testUnit';
    const result = getUnitIdFormatted(type, unitId);
    expect(result).toBe(i18n.global.t('{unit}_PER_HOUR', { unit: unitId }));
  });

  it('should return unitId for unknown type', () => {
    const type = 'UNKNOWN_TYPE';
    const unitId = 'testUnit';
    const result = getUnitIdFormatted(type, unitId);
    expect(result).toBe(unitId);
  });
});
