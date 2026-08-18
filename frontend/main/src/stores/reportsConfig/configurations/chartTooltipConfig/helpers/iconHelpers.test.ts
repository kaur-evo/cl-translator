import { describe, expect, it } from 'vitest';

import type { IconResolverParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { resolveIcon } from '@/helpers/tooltips/IconResolver';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

describe('iconHelpers (legacy)', () => {
  describe('resolveIcon', () => {
    describe('X-axis icon (last dimension)', () => {
      it('should return iconXAxis for last item in groupBy array', () => {
        const params: IconResolverParams = {
          key: xAxisKey.ENTITY_ID,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 2,
        };
        expect(resolveIcon(params)).toBe('iconXAxis');
      });

      it('should return iconXAxis for single grouping', () => {
        const params: IconResolverParams = {
          key: xAxisKey.ENTITY_ID,
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 0,
        };
        expect(resolveIcon(params)).toBe('iconXAxis');
      });
    });

    describe('XZ-axis icon (second dimension)', () => {
      it('should return iconXZAxis for second item in multi-dimensional grouping', () => {
        const params: IconResolverParams = {
          key: xAxisKey.PRODUCT_ID,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 1,
        };
        expect(resolveIcon(params)).toBe('iconXZAxis');
      });

      it('should return iconXAxis for index 1 with two groupings (last dimension takes priority)', () => {
        const params: IconResolverParams = {
          key: xAxisKey.PRODUCT_ID,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 1,
        };
        // In legacy implementation, last dimension check comes before Z-axis check
        // So index 1 in a 2-item array is BOTH second dimension AND last dimension
        // Last dimension wins and returns iconXAxis
        expect(resolveIcon(params)).toBe('iconXAxis');
      });
    });

    describe('Dot icon (intermediate dimensions)', () => {
      it('should return iconDot for first dimension with multiple groupings', () => {
        const params: IconResolverParams = {
          key: xAxisKey.STATION_ID,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 0,
        };
        expect(resolveIcon(params)).toBe('iconDot');
      });

      it('should return iconDot for middle dimension with multiple groupings', () => {
        const params: IconResolverParams = {
          key: xAxisKey.SKU,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.PRODUCT_ID, xAxisKey.SKU, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 2,
        };
        expect(resolveIcon(params)).toBe('iconDot');
      });

      it('should not return iconDot for single grouping', () => {
        const params: IconResolverParams = {
          key: xAxisKey.STATION_ID,
          groupBy: [xAxisKey.STATION_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 0,
        };
        // Single grouping is last dimension, returns iconXAxis
        expect(resolveIcon(params)).toBe('iconXAxis');
      });
    });

    describe('Primary Y-axis icon', () => {
      it('should return iconYAxis for primary Y-axis', () => {
        const params: IconResolverParams = {
          key: yAxisKey.DURATION,
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.DURATION,
          yAxisRight: null,
        };
        expect(resolveIcon(params)).toBe('iconYAxis');
      });

      it('should return iconYAxis when key matches yAxis without index', () => {
        const params: IconResolverParams = {
          key: yAxisKey.VALUE,
          groupBy: [xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: yAxisKey.ENTITY_COUNT,
        };
        expect(resolveIcon(params)).toBe('iconYAxis');
      });
    });

    describe('Secondary Y-axis icon', () => {
      it('should return icon2ndYAxis for secondary Y-axis', () => {
        const params: IconResolverParams = {
          key: yAxisKey.ENTITY_COUNT,
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.DURATION,
          yAxisRight: yAxisKey.ENTITY_COUNT,
        };
        expect(resolveIcon(params)).toBe('icon2ndYAxis');
      });

      it('should not return icon2ndYAxis when yAxisRight is null', () => {
        const params: IconResolverParams = {
          key: yAxisKey.ENTITY_COUNT,
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.DURATION,
          yAxisRight: null,
        };
        expect(resolveIcon(params)).toBe(null);
      });
    });

    describe('No icon for unmapped keys', () => {
      it('should return null when key does not match any condition', () => {
        const params: IconResolverParams = {
          key: 'unmapped',
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.DURATION,
          yAxisRight: null,
        };
        expect(resolveIcon(params)).toBe(null);
      });

      it('should return null when key does not match groupBy at index', () => {
        const params: IconResolverParams = {
          key: xAxisKey.PRODUCT_ID,
          groupBy: [xAxisKey.STATION_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 0, // groupBy[0] is STATION_ID, not PRODUCT_ID
        };
        expect(resolveIcon(params)).toBe(null);
      });

      it('should return null when index is undefined and key does not match axes', () => {
        const params: IconResolverParams = {
          key: 'unmapped',
          groupBy: [xAxisKey.STATION_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: yAxisKey.ENTITY_COUNT,
          index: undefined,
        };
        expect(resolveIcon(params)).toBe(null);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty groupBy array', () => {
        const params: IconResolverParams = {
          key: yAxisKey.DURATION,
          groupBy: [],
          yAxis: yAxisKey.DURATION,
          yAxisRight: null,
          index: 0,
        };
        // Empty groupBy[0] is undefined, won't match DURATION
        // Falls through to yAxis check
        expect(resolveIcon(params)).toBe('iconYAxis');
      });

      it('should handle index beyond groupBy length', () => {
        const params: IconResolverParams = {
          key: xAxisKey.ENTITY_ID,
          groupBy: [xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.VALUE,
          yAxisRight: null,
          index: 5,
        };
        // groupBy[5] is undefined, won't match ENTITY_ID
        expect(resolveIcon(params)).toBe(null);
      });

      it('should prioritize grouping over axis when both match', () => {
        const params: IconResolverParams = {
          key: xAxisKey.ENTITY_ID,
          groupBy: [xAxisKey.PRODUCT_ID, xAxisKey.ENTITY_ID],
          yAxis: yAxisKey.ENTITY_COUNT, // Different from groupBy key
          yAxisRight: null,
          index: 1, // Last dimension
        };
        // Should return iconXAxis (grouping check happens first)
        expect(resolveIcon(params)).toBe('iconXAxis');
      });
    });
  });
});
