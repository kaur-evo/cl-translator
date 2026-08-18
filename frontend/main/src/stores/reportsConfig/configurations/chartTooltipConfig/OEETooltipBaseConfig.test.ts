import { describe, expect, it } from 'vitest';

import { getOEELabelConfig, getOEEValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipBaseConfig';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';

describe('OEETooltipBaseConfig', () => {
  describe('getOEELabelConfig', () => {
    it('should return valid config objects for all OEE types', () => {
      const types = [
        preprocessorGroupType.OEE,
        preprocessorGroupType.AVAILABILITY,
        preprocessorGroupType.PERFORMANCE,
        preprocessorGroupType.QUALITY,
        preprocessorGroupType.TECHNICAL_AVAILABILITY,
      ];

      types.forEach((type) => {
        const config = getOEELabelConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.text).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getOEELabelConfig('UNKNOWN_TYPE')).toThrow('getOEELabelConfig unknown type: UNKNOWN_TYPE');
    });

    it('should throw error for empty string type', () => {
      expect(() => getOEELabelConfig('')).toThrow('getOEELabelConfig unknown type: ');
    });
  });

  describe('getOEEValueConfig', () => {
    it('should return valid config objects for all OEE types', () => {
      const types = [
        preprocessorGroupType.OEE,
        preprocessorGroupType.AVAILABILITY,
        preprocessorGroupType.PERFORMANCE,
        preprocessorGroupType.QUALITY,
        preprocessorGroupType.TECHNICAL_AVAILABILITY,
      ];

      types.forEach((type) => {
        const config = getOEEValueConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.tooltipValueKey).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getOEEValueConfig('UNKNOWN_TYPE')).toThrow('getOEEValueConfig unknown type: UNKNOWN_TYPE');
    });

    it('should throw error for empty string type', () => {
      expect(() => getOEEValueConfig('')).toThrow('getOEEValueConfig unknown type: ');
    });
  });
});
