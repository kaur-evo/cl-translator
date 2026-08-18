import { describe, expect, it } from 'vitest';

import { getQuantityLabelConfig, getQuantityValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipBaseConfig';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';


describe('quantityTooltipBaseConfig', () => {
  describe('getQuantityLabelConfig', () => {
    it('should return valid config objects for all quantity types', () => {
      const types = [
        preprocessorGroupType.POTENTIAL,
        preprocessorGroupType.GOOD,
        preprocessorGroupType.SCRAP,
        measure.ROW_PRODUCED_QTY,
        measure.IDEAL_QTY,
      ];

      types.forEach((type) => {
        const config = getQuantityLabelConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.text).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getQuantityLabelConfig('UNKNOWN_TYPE')).toThrow('getQuantityLabelConfig unknown type: UNKNOWN_TYPE');
    });
  });

  describe('getQuantityValueConfig', () => {
    it('should return valid config objects for standard units', () => {
      const types = [
        preprocessorGroupType.POTENTIAL,
        preprocessorGroupType.GOOD,
        preprocessorGroupType.SCRAP,
        measure.ROW_PRODUCED_QTY,
        measure.IDEAL_QTY,
      ];

      types.forEach((type) => {
        const config = getQuantityValueConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.tooltipValueKey).toBeDefined();
      });
    });

    it('should return valid config objects for alternative units', () => {
      const types = [
        preprocessorGroupType.POTENTIAL,
        preprocessorGroupType.GOOD,
        preprocessorGroupType.SCRAP,
        measure.ROW_PRODUCED_QTY,
        measure.IDEAL_QTY,
      ];

      types.forEach((type) => {
        const config = getQuantityValueConfig(type, yAxisKey.ALT_VALUE);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.tooltipValueKey).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getQuantityValueConfig('UNKNOWN_TYPE')).toThrow('getQuantityValueConfig unknown type: UNKNOWN_TYPE');
      expect(() => getQuantityValueConfig('UNKNOWN_TYPE', yAxisKey.ALT_VALUE)).toThrow('getQuantityValueConfig unknown type: UNKNOWN_TYPE');
    });
  });
});
