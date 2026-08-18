import { describe, expect, it, beforeEach } from 'vitest';

import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

describe('TooltipConfigBuilder', () => {
  describe('constructor', () => {
    it('should initialize with valid chartType', () => {
      const builder = new TooltipConfigBuilder('DOWNTIME');
      expect(builder).toBeInstanceOf(TooltipConfigBuilder);
      expect(builder.rowCount).toBe(0);
    });

    it('should throw error for empty chartType', () => {
      expect(() => new TooltipConfigBuilder('')).toThrow(
        'chartType must be a non-empty string, received: string',
      );
    });

    it('should throw error for non-string chartType', () => {
      expect(() => new TooltipConfigBuilder(null as unknown as string)).toThrow(
        'chartType must be a non-empty string, received: object',
      );
    });

    it('should throw error for undefined chartType', () => {
      expect(() => new TooltipConfigBuilder(undefined as unknown as string)).toThrow(
        'chartType must be a non-empty string, received: undefined',
      );
    });

    it('should throw error for number chartType', () => {
      expect(() => new TooltipConfigBuilder(123 as unknown as string)).toThrow(
        'chartType must be a non-empty string, received: number',
      );
    });
  });

  describe('addRow', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should add a row and return this for chaining', () => {
      const row: TooltipRowConfig = { text: 'Test Row' };
      const result = builder.addRow(row);

      expect(result).toBe(builder);
      expect(builder.rowCount).toBe(1);
    });

    it('should increment rowIndex with each added row', () => {
      builder.addRow({ text: 'Row 1' });
      expect(builder.rowCount).toBe(1);

      builder.addRow({ text: 'Row 2' });
      expect(builder.rowCount).toBe(2);

      builder.addRow({ text: 'Row 3' });
      expect(builder.rowCount).toBe(3);
    });

    it('should add rows with different configurations', () => {
      builder.addRow({ text: 'Simple row' });
      builder.addRow({
        valueKey: 'duration',
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
        icon: 'iconYAxis',
        color: '#FF0000',
      });

      expect(builder.rowCount).toBe(2);
    });
  });

  describe('addRows', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should add multiple rows and return this for chaining', () => {
      const rows: TooltipRowConfig[] = [
        { text: 'Row 1' },
        { text: 'Row 2' },
        { text: 'Row 3' },
      ];
      const result = builder.addRows(rows);

      expect(result).toBe(builder);
      expect(builder.rowCount).toBe(3);
    });

    it('should throw TypeError for non-array input', () => {
      expect(() => builder.addRows('not an array' as unknown as TooltipRowConfig[])).toThrow(
        'Expected an array, received: string',
      );
    });

    it('should throw TypeError for null input', () => {
      expect(() => builder.addRows(null as unknown as TooltipRowConfig[])).toThrow(
        'Expected an array, received: object',
      );
    });

    it('should handle empty array', () => {
      const result = builder.addRows([]);
      expect(result).toBe(builder);
      expect(builder.rowCount).toBe(0);
    });

    it('should call addRow for each item in the array', () => {
      const rows: TooltipRowConfig[] = [
        { text: 'A' },
        { text: 'B' },
      ];
      builder.addRows(rows);

      expect(builder.rowCount).toBe(2);
    });
  });

  describe('when', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should execute callback when boolean condition is true', () => {
      let executed = false;
      builder.when(true, (b) => {
        executed = true;
        b.addRow({ text: 'Conditional row' });
      });

      expect(executed).toBe(true);
      expect(builder.rowCount).toBe(1);
    });

    it('should not execute callback when boolean condition is false', () => {
      let executed = false;
      builder.when(false, (b) => {
        executed = true;
        b.addRow({ text: 'Should not be added' });
      });

      expect(executed).toBe(false);
      expect(builder.rowCount).toBe(0);
    });

    it('should evaluate function condition and execute if true', () => {
      let executed = false;
      builder.when(() => true, (b) => {
        executed = true;
        b.addRow({ text: 'Function condition row' });
      });

      expect(executed).toBe(true);
      expect(builder.rowCount).toBe(1);
    });

    it('should evaluate function condition and not execute if false', () => {
      let executed = false;
      builder.when(() => false, (b) => {
        executed = true;
        b.addRow({ text: 'Should not be added' });
      });

      expect(executed).toBe(false);
      expect(builder.rowCount).toBe(0);
    });

    it('should throw TypeError for non-function callback', () => {
      expect(() => builder.when(true, 'not a function' as unknown as (builder: TooltipConfigBuilder) => void)).toThrow(
        'Callback must be a function, received: string',
      );
    });

    it('should return this for chaining', () => {
      const result = builder.when(true, (b) => b.addRow({ text: 'Test' }));
      expect(result).toBe(builder);
    });

    it('should allow chaining even when condition is false', () => {
      const result = builder
        .when(false, (b) => b.addRow({ text: 'Skipped' }))
        .addRow({ text: 'Added' });

      expect(result).toBe(builder);
      expect(builder.rowCount).toBe(1);
    });
  });

  describe('filterByColumns', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should keep rows without valueKey', () => {
      builder.addRow({ text: 'No valueKey' });
      builder.filterByColumns(['column1']);

      expect(builder.rowCount).toBe(1);
    });

    it('should keep rows with isPrimary flag', () => {
      builder.addRow({ valueKey: 'duration', text: 'Primary', isPrimary: true });
      builder.filterByColumns([]);

      expect(builder.rowCount).toBe(1);
    });

    it('should keep rows with visibility="always"', () => {
      builder.addRow({ valueKey: 'duration', text: 'Always visible', visibility: 'always' });
      builder.filterByColumns([]);

      expect(builder.rowCount).toBe(1);
    });

    it('should keep rows with visibility="conditional"', () => {
      builder.addRow({ valueKey: 'duration', text: 'Conditionally visible', visibility: 'conditional' });
      builder.filterByColumns([]);

      expect(builder.rowCount).toBe(1);
    });

    it('should filter rows with visibility="column-filtered" not in visibleColumns', () => {
      builder.addRow({ valueKey: 'duration', text: 'Filtered', visibility: 'column-filtered' });
      builder.addRow({ valueKey: 'count', text: 'Included', visibility: 'column-filtered' });

      builder.filterByColumns(['count']);

      expect(builder.rowCount).toBe(1);
    });

    it('should default to "column-filtered" when visibility is undefined', () => {
      builder.addRow({ valueKey: 'duration', text: 'Row 1' });
      builder.addRow({ valueKey: 'count', text: 'Row 2' });

      builder.filterByColumns(['count']);

      expect(builder.rowCount).toBe(1);
    });

    it('should keep multiple rows matching visibleColumns', () => {
      builder.addRow({ valueKey: 'duration', text: 'Duration' });
      builder.addRow({ valueKey: 'count', text: 'Count' });
      builder.addRow({ valueKey: 'notes', text: 'Notes' });

      builder.filterByColumns(['duration', 'count']);

      expect(builder.rowCount).toBe(2);
    });

    it('should throw TypeError for non-array visibleColumns', () => {
      expect(() => builder.filterByColumns('not an array' as unknown as string[])).toThrow(
        'visibleColumns must be an array, received: string',
      );
    });

    it('should return this for chaining', () => {
      builder.addRow({ valueKey: 'duration', text: 'Test' });
      const result = builder.filterByColumns(['duration']);
      expect(result).toBe(builder);
    });

    it('should handle mixed visibility types correctly', () => {
      builder.addRow({ valueKey: 'always', text: 'Always', visibility: 'always' });
      builder.addRow({ valueKey: 'conditional', text: 'Conditional', visibility: 'conditional' });
      builder.addRow({ valueKey: 'filtered1', text: 'Filtered included', visibility: 'column-filtered' });
      builder.addRow({ valueKey: 'filtered2', text: 'Filtered excluded', visibility: 'column-filtered' });
      builder.addRow({ text: 'No valueKey' });
      builder.addRow({ valueKey: 'primary', text: 'Primary', isPrimary: true });

      builder.filterByColumns(['filtered1']);

      // Should keep: always, conditional, filtered1 (in visibleColumns), no valueKey, primary
      expect(builder.rowCount).toBe(5);
    });
  });

  describe('filterHidden', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should remove rows with isHidden=true', () => {
      builder.addRow({ text: 'Visible', isHidden: false });
      builder.addRow({ text: 'Hidden', isHidden: true });
      builder.addRow({ text: 'Also visible' });

      builder.filterHidden();

      expect(builder.rowCount).toBe(2);
    });

    it('should keep rows with isHidden=false', () => {
      builder.addRow({ text: 'Visible 1', isHidden: false });
      builder.addRow({ text: 'Visible 2', isHidden: false });

      builder.filterHidden();

      expect(builder.rowCount).toBe(2);
    });

    it('should keep rows without isHidden property', () => {
      builder.addRow({ text: 'Row 1' });
      builder.addRow({ text: 'Row 2' });

      builder.filterHidden();

      expect(builder.rowCount).toBe(2);
    });

    it('should return this for chaining', () => {
      builder.addRow({ text: 'Test' });
      const result = builder.filterHidden();
      expect(result).toBe(builder);
    });

    it('should handle all hidden rows', () => {
      builder.addRow({ text: 'Hidden 1', isHidden: true });
      builder.addRow({ text: 'Hidden 2', isHidden: true });

      builder.filterHidden();

      expect(builder.rowCount).toBe(0);
    });
  });

  describe('build', () => {
    let builder: TooltipConfigBuilder;

    beforeEach(() => {
      builder = new TooltipConfigBuilder('TEST');
    });

    it('should return array of rows', () => {
      const row1: TooltipRowConfig = { text: 'Row 1' };
      const row2: TooltipRowConfig = { text: 'Row 2' };

      builder.addRow(row1).addRow(row2);
      const result = builder.build();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(row1);
      expect(result[1]).toEqual(row2);
    });

    it('should throw Error when no rows exist', () => {
      expect(() => builder.build()).toThrow('Configuration must have at least one row');
    });

    it('should throw Error after filtering removes all rows', () => {
      builder.addRow({ valueKey: 'duration', text: 'Test' });
      builder.filterByColumns([]);

      expect(() => builder.build()).toThrow('Configuration must have at least one row');
    });

    it('should return correct rows after filtering', () => {
      builder
        .addRow({ valueKey: 'duration', text: 'Duration' })
        .addRow({ valueKey: 'count', text: 'Count' })
        .filterByColumns(['duration']);

      const result = builder.build();
      expect(result).toHaveLength(1);

      expect(result[0]?.text).toBe('Duration');
    });
  });

  describe('rowCount getter', () => {
    it('should return 0 for new builder', () => {
      const builder = new TooltipConfigBuilder('TEST');
      expect(builder.rowCount).toBe(0);
    });

    it('should return correct count after adding rows', () => {
      const builder = new TooltipConfigBuilder('TEST');
      builder.addRow({ text: 'Row 1' });
      expect(builder.rowCount).toBe(1);

      builder.addRow({ text: 'Row 2' });
      expect(builder.rowCount).toBe(2);
    });

    it('should return correct count after filtering', () => {
      const builder = new TooltipConfigBuilder('TEST');
      builder
        .addRow({ valueKey: 'duration', text: 'Duration' })
        .addRow({ valueKey: 'count', text: 'Count' })
        .filterByColumns(['duration']);

      expect(builder.rowCount).toBe(1);
    });
  });

  describe('clear', () => {
    it('should reset rows and rowIndex', () => {
      const builder = new TooltipConfigBuilder('TEST');
      builder.addRow({ text: 'Row 1' });
      builder.addRow({ text: 'Row 2' });

      expect(builder.rowCount).toBe(2);

      builder.clear();

      expect(builder.rowCount).toBe(0);
    });

    it('should return this for chaining', () => {
      const builder = new TooltipConfigBuilder('TEST');
      builder.addRow({ text: 'Row 1' });

      const result = builder.clear();

      expect(result).toBe(builder);
    });

    it('should allow building new configuration after clear', () => {
      const builder = new TooltipConfigBuilder('TEST');
      builder.addRow({ text: 'Old row' });
      builder.clear();
      builder.addRow({ text: 'New row' });

      const result = builder.build();
      expect(result).toHaveLength(1);

      expect(result[0]?.text).toBe('New row');
    });
  });

  describe('method chaining', () => {
    it('should support fluent API with multiple method calls', () => {
      const builder = new TooltipConfigBuilder('TEST');

      const result = builder
        .addRow({ text: 'Row 1' })
        .addRow({ valueKey: 'duration', text: 'Duration' })
        .when(true, (b) => b.addRow({ text: 'Conditional row' }))
        .addRows([{ text: 'Row 4' }, { text: 'Row 5' }])
        .filterByColumns(['duration'])
        .filterHidden()
        .build();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should support complex chaining with conditional logic', () => {
      const visibleColumns = ['duration', 'count'];
      const includeOptional = true;

      const result = new TooltipConfigBuilder('DOWNTIME')
        .addRow({ text: 'Primary', isPrimary: true })
        .addRow({ valueKey: 'duration', text: 'Duration' })
        .addRow({ valueKey: 'count', text: 'Count' })
        .when(includeOptional, (b) => b.addRow({ valueKey: 'notes', text: 'Notes' }))
        .filterByColumns(visibleColumns)
        .filterHidden()
        .build();

      expect(result).toHaveLength(3); // Primary, Duration, Count (Notes filtered out)
    });
  });
});
