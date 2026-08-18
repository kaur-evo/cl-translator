import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  getTooltipData,
  getTooltipValue,
  getTooltipParamRows,
  generateTooltipHTML,
} from './TooltipRenderer';
import type { DynamicTooltipValue, TooltipTemplateFn, TooltipConfigFn, GenerateTooltipOptions } from './TooltipRenderer';

import type { TooltipRowConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

describe('TooltipRenderer', () => {
  describe('getTooltipData', () => {
    it('should extract data from d.data structure', () => {
      const eventData = {
        data: {
          entityName: 'Test Entity',
          value: 100,
        },
      };

      const result = getTooltipData(eventData);

      expect(result).toEqual({
        entityName: 'Test Entity',
        value: 100,
      });
    });

    it('should extract data from d[0] structure (array-like)', () => {
      const eventData = {
        0: {
          entityName: 'Array Entity',
          value: 200,
        },
        length: 1,
      };

      const result = getTooltipData(eventData);

      expect(result).toEqual({
        entityName: 'Array Entity',
        value: 200,
      });
    });

    it('should return null for null input', () => {
      const result = getTooltipData(null);
      expect(result).toBe(null);
    });

    it('should return null for undefined input', () => {
      const result = getTooltipData(undefined);
      expect(result).toBe(null);
    });

    it('should return null when data is null', () => {
      const eventData = { data: null };
      const result = getTooltipData(eventData);
      expect(result).toBe(null);
    });

    it('should return null when neither structure exists', () => {
      const eventData = { other: 'value' };
      const result = getTooltipData(eventData);
      expect(result).toBe(null);
    });

    it('should return null for primitive values', () => {
      expect(getTooltipData('string')).toBe(null);
      expect(getTooltipData(123)).toBe(null);
      expect(getTooltipData(true)).toBe(null);
    });

    it('should prioritize d.data over d[0]', () => {
      const eventData = {
        data: { source: 'data property' },
        0: { source: 'array index' },
      };

      const result = getTooltipData(eventData);
      expect(result).toEqual({ source: 'data property' });
    });
  });

  describe('getTooltipValue', () => {
    const mockData: ChartDataPoint = {
      entityName: 'Test Entity',
      duration: 3600,
      durationFormatted: '1h',
      color: '#FF0000',
    };

    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should return function result when tooltipValue is a function', () => {
      const tooltipValue = (data: ChartDataPoint) => `Entity: ${data.entityName}`;
      const result = getTooltipValue(mockData, tooltipValue, undefined);

      expect(result).toBe('Entity: Test Entity');
    });

    it('should return string when tooltipValue is a string', () => {
      const tooltipValue = 'Static value';
      const result = getTooltipValue(mockData, tooltipValue, undefined);

      expect(result).toBe('Static value');
    });

    it('should lookup data[tooltipValueKey] when tooltipValue is undefined', () => {
      const result = getTooltipValue(mockData, undefined, 'durationFormatted');

      expect(result).toBe('1h');
    });

    it('should return undefined when key not found in data', () => {
      const result = getTooltipValue(mockData, undefined, 'nonexistent');

      expect(result).toBe(undefined);
    });

    it('should warn for undefined non-optional keys', () => {
      getTooltipValue(mockData, undefined, 'missingKey');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Tooltip: data.missingKey is undefined',
        expect.objectContaining({
          data: mockData,
          tooltipValueKey: 'missingKey',
        }),
      );
    });

    it('should not warn for undefined optional keys (icon)', () => {
      getTooltipValue(mockData, undefined, 'icon');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for undefined optional keys (text)', () => {
      getTooltipValue(mockData, undefined, 'text');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for undefined optional keys (color)', () => {
      getTooltipValue(mockData, undefined, 'color');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return value when tooltipValueKey exists', () => {
      const result = getTooltipValue(mockData, undefined, 'duration');

      expect(result).toBe(3600);
    });

    it('should prioritize tooltipValue function over tooltipValueKey', () => {
      const tooltipValue = () => 'Function result';
      const result = getTooltipValue(mockData, tooltipValue, 'durationFormatted');

      expect(result).toBe('Function result');
    });

    it('should prioritize tooltipValue string over tooltipValueKey', () => {
      const tooltipValue = 'String value';
      const result = getTooltipValue(mockData, tooltipValue, 'durationFormatted');

      expect(result).toBe('String value');
    });

    it('should handle tooltipValue as 0 (falsy but valid)', () => {
      const result = getTooltipValue(mockData, 0 as unknown as DynamicTooltipValue, 'durationFormatted');

      expect(result).toBe('1h'); // Falls through to lookup
    });

    it('should handle tooltipValue as empty string (falsy but valid)', () => {
      const result = getTooltipValue(mockData, '' as unknown as DynamicTooltipValue, 'durationFormatted');

      expect(result).toBe(''); // Empty string is valid
    });

    it('should handle complex function returning object', () => {
      const tooltipValue = (data: ChartDataPoint) => ({ value: data.duration });
      // @ts-expect-error: function returns object, not string
      const result = getTooltipValue(mockData, tooltipValue, undefined);
      expect(result).toEqual({ value: 3600 });
    });
  });

  describe('getTooltipParamRows', () => {
    const mockData: ChartDataPoint = {
      entityName: 'Test Entity',
      duration: 3600,
      durationFormatted: '1h',
      count: 5,
      color: '#FF0000',
      icon: 'iconYAxis',
    };

    it('should transform simple row configs', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        {
          tooltipValueKey: 'durationFormatted',
          text: 'Duration',
          color: '#FF0000',
          icon: 'iconYAxis',
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);

      expect(result).toEqual([
        {
          key: 'Duration',
          value: '1h',
          secondaryValue: undefined,
          color: '#FF0000',
          icon: 'iconYAxis',
          isPrimary: undefined,
        },
      ]);
    });

    it('should handle primary rows (text is value)', () => {
      // Use data without color/icon to test primary row handling cleanly
      const cleanData: ChartDataPoint = {
        entityName: 'Test Entity',
      };

      const tooltipConfig: TooltipRowConfig[] = [
        {
          text: 'Entity Name Value',
          isPrimary: true,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, cleanData);

      expect(result).toEqual([
        {
          key: undefined,
          value: 'Entity Name Value',
          secondaryValue: undefined,
          color: undefined,
          icon: undefined,
          isPrimary: true,
        },
      ]);
    });

    it('should evaluate function-based text', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        {
          tooltipValueKey: 'count',
          text: (data: ChartDataPoint) => `Count for ${data.entityName}`,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);


      expect(result[0]?.key).toBe('Count for Test Entity');

      expect(result[0]?.value).toBe(5);
    });

    it('should evaluate function-based color', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        {
          tooltipValueKey: 'count',
          text: 'Count',
          color: (data: ChartDataPoint) => data.color as string,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);


      expect(result[0]?.color).toBe('#FF0000');
    });

    it('should evaluate function-based icon', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        {
          tooltipValueKey: 'count',
          text: 'Count',
          icon: (data: ChartDataPoint) => data.icon as string,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);


      expect(result[0]?.icon).toBe('iconYAxis');
    });

    it('should include secondaryValue when present', () => {
      const dataWithSecondary: ChartDataPoint = {
        ...mockData,
        countPct: '50%',
      };

      const tooltipConfig: TooltipRowConfig[] = [
        {
          tooltipValueKey: 'count',
          tooltipSecondaryValueKey: 'countPct',
          text: 'Count',
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, dataWithSecondary);


      expect(result[0]?.value).toBe(5);

      expect(result[0]?.secondaryValue).toBe('50%');
    });

    it('should handle tooltipValue function instead of tooltipValueKey', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        {
          text: 'Dynamic value',
          tooltipValue: (data: ChartDataPoint) => `${data.duration}s`,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);


      expect(result[0]?.value).toBe('3600s');
    });

    it('should handle multiple rows', () => {
      const tooltipConfig: TooltipRowConfig[] = [
        { text: 'Entity', isPrimary: true },
        { tooltipValueKey: 'durationFormatted', text: 'Duration' },
        { tooltipValueKey: 'count', text: 'Count' },
      ];

      const result = getTooltipParamRows(tooltipConfig, mockData);

      expect(result).toHaveLength(3);

      expect(result[0]?.isPrimary).toBe(true);

      expect(result[1]?.key).toBe('Duration');

      expect(result[2]?.key).toBe('Count');
    });

    it('should handle number text values (falls back to data lookup)', () => {
      const dataWithText: ChartDataPoint = {
        count: 5,
        text: 'From data',
      };

      const tooltipConfig: TooltipRowConfig[] = [
        {
          text: 42, // Numbers aren't explicitly handled, falls back to data lookup
          tooltipValueKey: 'count',
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, dataWithText);

      // getTooltipValue doesn't handle numbers explicitly, looks up data['text'] instead

      expect(result[0]?.key).toBe('From data');
    });

    it('should handle null icon (not explicitly supported, returns undefined)', () => {
      const cleanData: ChartDataPoint = {
        count: 5,
      };

      const tooltipConfig: TooltipRowConfig[] = [
        {
          text: 'Test',
          tooltipValueKey: 'count',
          icon: null,
        },
      ];

      const result = getTooltipParamRows(tooltipConfig, cleanData);

      // getTooltipValue doesn't handle null explicitly, looks up data['icon'] which is undefined
      // and since 'icon' is an optional key, no warning is logged

      expect(result[0]?.icon).toBe(undefined);
    });
  });

  describe('generateTooltipHTML', () => {
    const mockGetConfigFn: TooltipConfigFn = vi.fn((_options) => [
      {
        text: 'Test Entity',
        isPrimary: true,
      },
      {
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
      },
    ]);

    const mockTemplateFn: TooltipTemplateFn = vi.fn((params) => `<div>${params.paramRows.length} rows</div>`);

    const mockOptions: GenerateTooltipOptions = {
      cfgType: 'DOWNTIME',
      groupBy: ['entity'],
      yAxis: 'duration',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should generate HTML for valid data', () => {
      const eventData = {
        data: {
          entityName: 'Test',
          durationFormatted: '1h',
        },
      };

      const result = generateTooltipHTML(
        mockGetConfigFn,
        mockTemplateFn,
        mockOptions,
        eventData,
      );

      expect(result).toBe('<div>2 rows</div>');
      expect(mockGetConfigFn).toHaveBeenCalled();
      expect(mockTemplateFn).toHaveBeenCalledWith({
        paramRows: expect.any(Array),
        useAxisIcons: true,
      });
    });

    it('should return empty string for null data', () => {
      const result = generateTooltipHTML(
        mockGetConfigFn,
        mockTemplateFn,
        mockOptions,
        null,
      );

      expect(result).toBe('');
      expect(mockGetConfigFn).not.toHaveBeenCalled();
      expect(mockTemplateFn).not.toHaveBeenCalled();
    });

    it('should throw error for missing config function result', () => {
      const nullConfigFn = vi.fn(() => null) as unknown as TooltipConfigFn;

      const eventData = { data: { test: 'value' } };

      expect(() => generateTooltipHTML(nullConfigFn, mockTemplateFn, mockOptions, eventData))
        .toThrow('Tooltip configuration not found for chart type: DOWNTIME');
    });

    it('should include context in error messages', () => {
      const errorConfigFn: TooltipConfigFn = vi.fn(() => {
        throw new Error('Config error');
      });

      const eventData = { data: { test: 'value' } };

      expect(() => generateTooltipHTML(errorConfigFn, mockTemplateFn, mockOptions, eventData))
        .toThrow('Failed to generate tooltip for DOWNTIME chart (yAxis: duration, groupBy: [entity]): Config error');
    });

    it('should pass all options to config function', () => {
      const eventData = {
        data: {
          entityName: 'Test',
        },
      };

      const fullOptions: GenerateTooltipOptions = {
        cfgType: 'OEE',
        groupBy: ['entity', 'product'],
        yAxis: 'oee',
        yAxisRight: 'availability',
        granularity: 'SHIFT',
        chartLegendState: ['oee', 'availability'],
        totals: { total: 100 },
        visibleColumns: ['oee', 'availability'],
      };

      generateTooltipHTML(mockGetConfigFn, mockTemplateFn, fullOptions, eventData);

      expect(mockGetConfigFn).toHaveBeenCalledWith(
        expect.objectContaining({
          cfgType: 'OEE',
          groupBy: ['entity', 'product'],
          yAxis: 'oee',
          yAxisRight: 'availability',
          granularity: 'SHIFT',
          chartLegendState: ['oee', 'availability'],
          totals: { total: 100 },
          visibleColumns: ['oee', 'availability'],
          data: expect.objectContaining({ entityName: 'Test' }),
        }),
      );
    });

    it('should pass useAxisIcons=true to template', () => {
      const eventData = { data: { test: 'value' } };

      generateTooltipHTML(mockGetConfigFn, mockTemplateFn, mockOptions, eventData);

      expect(mockTemplateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          useAxisIcons: true,
        }),
      );
    });

    it('should handle template function errors', () => {
      const errorTemplateFn = vi.fn(() => {
        throw new Error('Template error');
      }) as unknown as TooltipTemplateFn;

      const eventData = { data: { test: 'value' } };

      expect(() => generateTooltipHTML(mockGetConfigFn, errorTemplateFn, mockOptions, eventData))
        .toThrow('Failed to generate tooltip for DOWNTIME chart (yAxis: duration, groupBy: [entity]): Template error');
    });

    it('should provide context even without cfgType', () => {
      const errorConfigFn: TooltipConfigFn = vi.fn(() => {
        throw new Error('Error');
      });

      const optionsWithoutCfgType = {
        ...mockOptions,
        cfgType: '',
      };

      const eventData = { data: { test: 'value' } };

      expect(() => generateTooltipHTML(errorConfigFn, mockTemplateFn, optionsWithoutCfgType, eventData))
        .toThrow('Failed to generate tooltip: Error');
    });

    it('should handle eventData with d[0] structure', () => {
      const eventData = {
        0: {
          entityName: 'Array Test',
          durationFormatted: '2h',
        },
      };

      const result = generateTooltipHTML(
        mockGetConfigFn,
        mockTemplateFn,
        mockOptions,
        eventData,
      );

      expect(result).toBe('<div>2 rows</div>');
    });

    it('should return empty string when getTooltipData returns null', () => {
      const invalidEventData = { invalid: 'structure' };

      const result = generateTooltipHTML(
        mockGetConfigFn,
        mockTemplateFn,
        mockOptions,
        invalidEventData,
      );

      expect(result).toBe('');
    });
  });
});
