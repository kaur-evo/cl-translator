import specialKey from '../constants/specialKey';

import {
  getPrimaryGroupBy,
  getKeyString,
  getHighestLevelGroupBy,
  getHighestLevelGroupBySorting,
} from './dataGroupingConfig';

import granularity from '@/stores/reportsConfig/constants/granularity';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import config from '@/stores/reportsConfig/constants/configType';

describe('dataGroupingConfig', () => {
  describe('getPrimaryGroupBy', () => {
    it('should return the primary group by key for the given config type and requirements', () => {
      const configType = config.DOWNTIME;
      const requirements = {
        granularity: granularity.TOTAL,
        groupBy: [xAxisKey.ENTITY_ID],
      };

      const result = getPrimaryGroupBy(configType, requirements);

      expect(result).toBe('commentId');
    });

    it('returns "lotCode" for LOT_CODE xAxisKey', () => {
      const result = getPrimaryGroupBy(config.DOWNTIME, {
        granularity: granularity.TOTAL,
        groupBy: [xAxisKey.LOT_CODE],
      });
      expect(result).toBe('lotCode');
    });

    it('returns "productionOrder" for PRODUCTION_ORDER xAxisKey', () => {
      const result = getPrimaryGroupBy(config.DOWNTIME, {
        granularity: granularity.TOTAL,
        groupBy: [xAxisKey.PRODUCTION_ORDER],
      });
      expect(result).toBe('productionOrder');
    });

    it('should return the granularity if the requirements granularity is not "TOTAL"', () => {
      const configType = config.SCRAPREASON;
      const requirements = {
        granularity: 'HOURLY',
        groupBy: [xAxisKey.ENTITY_ID],
      };

      const result = getPrimaryGroupBy(configType, requirements);

      expect(result).toBe('HOURLY');
    });
  });

  describe('getKeyString', () => {
    it('should return the key string for the given entry and keys', () => {
      const entry = {
        commentColor: 'red',
        commentgroupId: 1,
      };
      const keys = ['commentColor', 'commentgroupId'];

      const result = getKeyString(entry, keys);

      expect(result).toBe('red-1');
    });

    it('should return null if any of the keys are undefined in the entry', () => {
      const entry = {
        commentColor: 'red',
      };
      const keys = ['commentColor', 'commentgroupId'];

      const result = getKeyString(entry, keys);

      expect(result).toBeNull();
    });
  });

  describe('getHighestLevelGroupBy', () => {
    it('should return the correct group by key for OEE config type', () => {
      const configType = config.OEE;
      const requirements = {};

      const result = getHighestLevelGroupBy(configType, requirements);

      expect(result).toBe(specialKey.PREPROCESSED_GROUP_ID_KEY);
    });

    it('should return the correct group by key for DOWNTIME config type', () => {
      const configType = config.DOWNTIME;
      const requirements = {};

      const result = getHighestLevelGroupBy(configType, requirements);

      expect(result).toBe('commentgroupId');
    });

    it('should return the correct group by key for SPEEDLOSS config type', () => {
      const configType = config.SPEEDLOSS;
      const requirements = {};

      const result = getHighestLevelGroupBy(configType, requirements);

      expect(result).toBe('performanceCommentGroupId');
    });

    it('should return the correct group by key for SCRAPREASON config type', () => {
      const configType = config.SCRAPREASON;
      const requirements = {};

      const result = getHighestLevelGroupBy(configType, requirements);

      expect(result).toBe('scrapreasongroupid');
    });
  });

  describe('getHighestLevelGroupBySorting', () => {
    it('should return the secondary group by sorting function for the given config type', () => {
      const configType = config.OEE;

      const result = getHighestLevelGroupBySorting(configType);

      expect(result).toBeInstanceOf(Function);
    });
  });
});
