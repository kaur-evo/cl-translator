import { describe, expect, it } from 'vitest';

import { getTimeUsageLabelConfig, getTimeUsageValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipBaseConfig';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';

describe('timeUsageTooltipBaseConfig', () => {
  describe('getTimeUsageLabelConfig', () => {
    it('should return valid config objects for all time usage types', () => {
      const types = [
        preprocessorGroupType.UNCOMMENTED_STOP,
        preprocessorGroupType.UNPLANNED_STOP,
        preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE,
        preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
        preprocessorGroupType.SLOW,
        preprocessorGroupType.GOOD,
        measure.PLANNED_TIME,
        calcMeasure.SHIFT_TIME,
        calcMeasure.OPERATING_TIME,
      ];

      types.forEach((type) => {
        const config = getTimeUsageLabelConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.text).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getTimeUsageLabelConfig('UNKNOWN_TYPE')).toThrow('getTimeUsageLabelConfig unknown type: UNKNOWN_TYPE');
    });
  });

  describe('getTimeUsageValueConfig', () => {
    it('should return valid config objects for all time usage types', () => {
      const types = [
        preprocessorGroupType.UNCOMMENTED_STOP,
        preprocessorGroupType.UNPLANNED_STOP,
        preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE,
        preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
        preprocessorGroupType.SLOW,
        preprocessorGroupType.GOOD,
        measure.PLANNED_TIME,
        calcMeasure.SHIFT_TIME,
        calcMeasure.OPERATING_TIME,
      ];

      types.forEach((type) => {
        const config = getTimeUsageValueConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.tooltipValueKey).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getTimeUsageValueConfig('UNKNOWN_TYPE')).toThrow('getTimeUsageValueConfig unknown type: UNKNOWN_TYPE');
    });
  });
});
