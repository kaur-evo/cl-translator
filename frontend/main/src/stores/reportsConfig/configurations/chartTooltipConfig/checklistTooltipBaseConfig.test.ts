import { describe, expect, it } from 'vitest';

import { getChecklistLabelConfig, getChecklistValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipBaseConfig';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';

describe('checklistTooltipBaseConfig', () => {
  describe('getChecklistLabelConfig', () => {
    it('should return valid config objects for all checklist types', () => {
      const types = [
        preprocessorGroupType.CHECKLIST_MISSED,
        preprocessorGroupType.CHECKLIST_UNSUCCESSFUL,
        preprocessorGroupType.CHECKLIST_SUCCESSFUL,
      ];

      types.forEach((type) => {
        const config = getChecklistLabelConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.text).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getChecklistLabelConfig('UNKNOWN_TYPE')).toThrow('getChecklistLabelConfig unknown type: UNKNOWN_TYPE');
    });

    it('should throw error for empty string type', () => {
      expect(() => getChecklistLabelConfig('')).toThrow('getChecklistLabelConfig unknown type: ');
    });
  });

  describe('getChecklistValueConfig', () => {
    it('should return valid config objects for all checklist types', () => {
      const types = [
        preprocessorGroupType.CHECKLIST_MISSED,
        preprocessorGroupType.CHECKLIST_UNSUCCESSFUL,
        preprocessorGroupType.CHECKLIST_SUCCESSFUL,
      ];

      types.forEach((type) => {
        const config = getChecklistValueConfig(type);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
        expect(config.tooltipValueKey).toBeDefined();
      });
    });

    it('should throw error for unknown type', () => {
      expect(() => getChecklistValueConfig('UNKNOWN_TYPE')).toThrow('getChecklistValueConfig unknown type: UNKNOWN_TYPE');
    });

    it('should throw error for empty string type', () => {
      expect(() => getChecklistValueConfig('')).toThrow('getChecklistValueConfig unknown type: ');
    });
  });
});
