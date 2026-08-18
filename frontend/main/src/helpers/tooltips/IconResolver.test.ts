import { describe, expect, it } from 'vitest';

import { resolveIcon, ICON_TYPES } from './IconResolver';

import type { IconResolverParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

describe('IconResolver', () => {
  describe('ICON_TYPES constants', () => {
    it('should export all icon type constants', () => {
      expect(ICON_TYPES.Y_AXIS).toBe('iconYAxis');
      expect(ICON_TYPES.Y_AXIS_2ND).toBe('icon2ndYAxis');
      expect(ICON_TYPES.X_AXIS).toBe('iconXAxis');
      expect(ICON_TYPES.XZ_AXIS).toBe('iconXZAxis');
      expect(ICON_TYPES.DOT).toBe('iconDot');
    });
  });

  describe('resolveIcon - Grouping dimensions', () => {
    it('should return iconXAxis for third dimension', () => {
      const params: IconResolverParams = {
        key: xAxisKey.ENTITY_ID,
        groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 2,
      };
      expect(resolveIcon(params)).toBe('iconXAxis');
    });

    it('should return iconXAxis for single grouping at index 0', () => {
      const params: IconResolverParams = {
        key: xAxisKey.ENTITY_ID,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 0,
      };
      expect(resolveIcon(params)).toBe('iconXAxis');
    });

    it('should return iconXZAxis for second dimension with multiple groupings', () => {
      const params: IconResolverParams = {
        key: xAxisKey.PRODUCT_ID,
        groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 1,
      };
      expect(resolveIcon(params)).toBe('iconXZAxis');
    });

    it('should return iconDot for first dimension with multiple groupings', () => {
      const params: IconResolverParams = {
        key: xAxisKey.STATION_ID,
        groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 0,
      };
      expect(resolveIcon(params)).toBe('iconDot');
    });

    it('should return iconDot for third dimension with multiple groupings', () => {
      const params: IconResolverParams = {
        key: xAxisKey.SKU,
        groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.SKU, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 2,
      };
      expect(resolveIcon(params)).toBe('iconDot');
    });

    it('should return null for non-matching grouping', () => {
      const params: IconResolverParams = {
        key: 'nonexistent',
        groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID],
        yAxis: yAxisKey.VALUE,
        index: 0,
      };
      expect(resolveIcon(params)).toBe(null);
    });

    it('should return null when key does not match groupBy at index', () => {
      const params: IconResolverParams = {
        key: xAxisKey.PRODUCT_ID,
        groupBy: [xAxisKey.STATION_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 0,
      };
      expect(resolveIcon(params)).toBe(null);
    });
  });

  describe('resolveIcon - Axis mapping', () => {
    it('should return iconYAxis for primary Y-axis', () => {
      const params: IconResolverParams = {
        key: yAxisKey.DURATION,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
      };
      expect(resolveIcon(params)).toBe('iconYAxis');
    });

    it('should return icon2ndYAxis for secondary Y-axis', () => {
      const params: IconResolverParams = {
        key: yAxisKey.ENTITY_COUNT,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
        yAxisRight: yAxisKey.ENTITY_COUNT,
      };
      expect(resolveIcon(params)).toBe('icon2ndYAxis');
    });

    it('should return null for unmapped axis', () => {
      const params: IconResolverParams = {
        key: 'unmapped',
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
        yAxisRight: yAxisKey.ENTITY_COUNT,
      };
      expect(resolveIcon(params)).toBe(null);
    });

    it('should return null when yAxisRight is null', () => {
      const params: IconResolverParams = {
        key: yAxisKey.ENTITY_COUNT,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
        yAxisRight: null,
      };
      expect(resolveIcon(params)).toBe(null);
    });
  });

  describe('resolveIcon - Priority ordering', () => {
    it('should prioritize grouping over axis when index provided and matches', () => {
      const params: IconResolverParams = {
        key: xAxisKey.ENTITY_ID,
        groupBy: [xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.ENTITY_COUNT,
        index: 1,
      };
      expect(resolveIcon(params)).toBe('iconXAxis');
    });

    it('should fallback to axis when index provided but grouping does not match', () => {
      const params: IconResolverParams = {
        key: yAxisKey.DURATION,
        groupBy: [xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
        index: 0,
      };
      expect(resolveIcon(params)).toBe('iconYAxis');
    });

    it('should use axis mapping when index is not provided', () => {
      const params: IconResolverParams = {
        key: yAxisKey.DURATION,
        groupBy: [xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.DURATION,
      };
      expect(resolveIcon(params)).toBe('iconYAxis');
    });
  });

  describe('resolveIcon - Edge cases', () => {
    it('should handle empty groupBy array', () => {
      const params: IconResolverParams = {
        key: yAxisKey.DURATION,
        groupBy: [],
        yAxis: yAxisKey.DURATION,
        index: 0,
      };
      expect(resolveIcon(params)).toBe('iconYAxis');
    });

    it('should handle undefined yAxis', () => {
      const params: IconResolverParams = {
        key: yAxisKey.DURATION,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: undefined,
      };
      expect(resolveIcon(params)).toBe(null);
    });

    it('should handle index beyond groupBy length', () => {
      const params: IconResolverParams = {
        key: xAxisKey.ENTITY_ID,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: 5,
      };
      expect(resolveIcon(params)).toBe(null);
    });

    it('should handle negative index', () => {
      const params: IconResolverParams = {
        key: xAxisKey.ENTITY_ID,
        groupBy: [xAxisKey.ENTITY_ID],
        yAxis: yAxisKey.VALUE,
        index: -1,
      };
      expect(resolveIcon(params)).toBe(null);
    });
  });
});
