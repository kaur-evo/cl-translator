import ReportsChart from './ReportsChart';

import chartType from '@/stores/reportsConfig/constants/chartType';
import configType from '@/stores/reportsConfig/constants/configType';

describe('ReportsChart', () => {
  vi.mock('@/helpers/html/tooltipTemplate', () => ({
    default: vi.fn(),
  }));

  vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig', () => ({
    default: vi.fn(),
  }));

  const mocks = vi.hoisted(() => ({
    showTooltip: vi.fn(),
    hideTooltip: vi.fn(),
  }));
  vi.mock('@/helpers/d3Helpers', () => ({
    showTooltip: mocks.showTooltip,
    hideTooltip: mocks.hideTooltip,
  }));
  describe('getColumnChartArgs', () => {
    vi.mock('@/stores/reportsConfig/configurations/chartSubGroupLabelConfig', () => ({
      default: vi.fn().mockReturnValue('mockLabelKey'),
    }));

    it('should return the correct arguments for the column chart', () => {
      const chart = new ReportsChart({});
      chart.calculatedData = [{ key: 'value' }];
      chart.yAxisKey = 'yAxisKey';
      chart.chartType = [chartType.STACKED_COLUMN];
      chart.configType = configType.OEE;
      chart.groupBy = ['group1', 'group2'];
      chart.element = { clientWidth: 100 };
      chart.chartLegendState = ['group1', 'group2'];
      vi.spyOn(chart, 'isTimeUsageCompactMode', 'get').mockReturnValue(false);
      vi.spyOn(chart, 'showTooltipFn').mockReturnValue(() => {});
      vi.spyOn(chart, 'recalculatedBars', 'get').mockReturnValue([{ key: 'value' }]);
      vi.spyOn(chart, 'width', 'get').mockReturnValue(100);
      vi.spyOn(chart, 'recalculatedBars', 'get').mockReturnValue([{ key: 'value' }]);

      const result = chart.getColumnChartArgs();

      expect(result).toEqual([
        chart.recalculatedBars,
        {
          yKey: 'yAxisKey',
          xKey: 'groupingKey',
          barMaxWidth: { 1: 10000, 2: 10000, 3: null },
          visible: true,
          isGrouped: false,
          isStacked: true,
          xzDomainKey: 'group2',
          dimensionCount: 3,
          labelKey: 'mockLabelKey',
          secondaryXZDomain: [],
          onMouseMove: chart.showTooltipFn,
          onMouseOut: mocks.hideTooltip,
        },
      ]);
    });

    it('should set visible to false if chartType does not include STACKED_COLUMN or GROUPED_COLUMN', () => {
      const chart = new ReportsChart({});
      chart.calculatedData = [];
      chart.groupBy = [];
      chart.chartType = [chartType.LINE];

      const result = chart.getColumnChartArgs();

      expect(result[1].visible).toBe(false);
    });

    it('should set isGrouped to true if chartType includes GROUPED_COLUMN', () => {
      const chart = new ReportsChart({});
      chart.calculatedData = [];
      chart.groupBy = [];
      chart.chartType = [chartType.GROUPED_COLUMN];

      const result = chart.getColumnChartArgs();

      expect(result[1].isGrouped).toBe(true);
    });

    it('should set xzDomainKey to the last element of groupBy if configType is not OEE', () => {
      const chart = new ReportsChart({});
      chart.calculatedData = [];
      chart.chartType = [];
      chart.configType = 'someOtherConfig';
      chart.groupBy = ['group1', 'group2'];

      const result = chart.getColumnChartArgs();

      expect(result[1].xzDomainKey).toBe('group2');
    });
  });

  describe('updateColumnChart', () => {
    it('should update the existing column chart if it exists in the chartRegistry', () => {
      const chart = new ReportsChart({});
      const mockUpdate = vi.fn();
      const mockArgs = ['arg1', 'arg2'];

      vi.spyOn(chart, 'getColumnChartArgs').mockReturnValue(mockArgs);
      chart.chartRegistry.set(chartType.COLUMN, { update: mockUpdate });

      chart.updateColumnChart();

      expect(mockUpdate).toHaveBeenCalledWith(...mockArgs);
    });

    it('should create a new column chart if it does not exist in the chartRegistry', () => {
      const chart = new ReportsChart({});
      const mockDrawVerticalBarChart = vi.fn();
      const mockArgs = ['arg1', 'arg2'];

      vi.spyOn(chart, 'getColumnChartArgs').mockReturnValue(mockArgs);
      vi.spyOn(chart, 'drawVerticalBarChart').mockImplementation(mockDrawVerticalBarChart);

      chart.updateColumnChart();

      expect(mockDrawVerticalBarChart).toHaveBeenCalledWith(...mockArgs);
      expect(chart.chartRegistry.has(chartType.COLUMN)).toBe(true);
    });

    it('should add the new column chart to the chartRegistry with the correct key', () => {
      const chart = new ReportsChart({});
      const mockDrawVerticalBarChart = vi.fn().mockReturnValue('mockChart');
      vi.spyOn(chart, 'getColumnChartArgs').mockReturnValue([]);
      vi.spyOn(chart, 'drawVerticalBarChart').mockImplementation(mockDrawVerticalBarChart);

      chart.updateColumnChart();

      expect(chart.chartRegistry.get(chartType.COLUMN)).toBe('mockChart');
    });
  });

  describe('getDotCircleRadius', () => {
    it('should return "0px" if d.length is true, chartLegendState has length, and chartLegendState does not include d.data["%groupId"]', () => {
      const chart = new ReportsChart({});
      chart.chartLegendState = ['group1', 'group2'];
      const input = {
        length: true,
        data: { '%groupId': 'group3' },
      };

      const result = chart.getDotCircleRadius(input);

      expect(result).toBe('0px');
    });

    it('should return "4px" if d.length is true, chartLegendState has length, and chartLegendState includes d.data["%groupId"]', () => {
      const chart = new ReportsChart({});
      chart.chartLegendState = ['group1', 'group2'];
      const input = {
        length: true,
        data: { '%groupId': 'group1' },
      };

      const result = chart.getDotCircleRadius(input);

      expect(result).toBe('4px');
    });

    it('should return "4px" if d.length is false', () => {
      const chart = new ReportsChart({});
      chart.chartLegendState = ['group1', 'group2'];
      const input = {
        length: false,
        data: { '%groupId': 'group3' },
      };

      const result = chart.getDotCircleRadius(input);

      expect(result).toBe('4px');
    });

    it('should return "4px" if chartLegendState is empty', () => {
      const chart = new ReportsChart({});
      chart.chartLegendState = [];
      const input = {
        length: true,
        data: { '%groupId': 'group3' },
      };

      const result = chart.getDotCircleRadius(input);

      expect(result).toBe('4px');
    });

    it('should return "4px" if d is undefined', () => {
      const chart = new ReportsChart({});
      chart.chartLegendState = ['group1', 'group2'];

      const result = chart.getDotCircleRadius(undefined);

      expect(result).toBe('4px');
    });
  });

  describe('getDotPlotChartArgs', () => {
    it('should return the correct arguments for the dot plot chart', () => {
      const chart = new ReportsChart({});
      chart.yAxisKey = 'yAxisKey';
      chart.chartType = [chartType.DOT_PLOT];
      vi.spyOn(chart, 'recalculatedBars', 'get').mockReturnValue([{ key: 'value' }]);
      vi.spyOn(chart, 'isCompactMode', 'get').mockReturnValue(false);
      vi.spyOn(chart, 'getDotCircleRadius').mockReturnValue('4px');

      const result = chart.getDotPlotChartArgs();

      expect(result).toEqual([
        chart.recalculatedBars,
        {
          yKey: 'yAxisKey',
          xKey: 'groupingKey',
          visible: true,
          getDotCircleRadius: chart.getDotCircleRadius,
          definedKey: 'data.defined',
          dimensionCount: 3,
        },
      ]);
    });

    it('should set visible to false if chartType does not include DOT_PLOT', () => {
      const chart = new ReportsChart({});
      chart.chartType = [chartType.LINE];
      vi.spyOn(chart, 'recalculatedBars', 'get').mockReturnValue([]);
      vi.spyOn(chart, 'isCompactMode', 'get').mockReturnValue(false);

      const result = chart.getDotPlotChartArgs();

      expect(result[1].visible).toBe(false);
    });

    it('should set visible to false if isCompactMode is true', () => {
      const chart = new ReportsChart({});
      chart.chartType = [chartType.DOT_PLOT];
      vi.spyOn(chart, 'recalculatedBars', 'get').mockReturnValue([]);
      vi.spyOn(chart, 'isCompactMode', 'get').mockReturnValue(true);

      const result = chart.getDotPlotChartArgs();

      expect(result[1].visible).toBe(false);
    });
  });

  describe('updateDotPlotChart', () => {
    it('should update the existing dot plot chart if it exists in the chartRegistry', () => {
      const chart = new ReportsChart({});
      const mockUpdate = vi.fn();
      const mockArgs = ['arg1', 'arg2'];

      vi.spyOn(chart, 'getDotPlotChartArgs').mockReturnValue(mockArgs);
      chart.chartRegistry.set(chartType.DOT_PLOT, { update: mockUpdate });

      chart.updateDotPlotChart();

      expect(mockUpdate).toHaveBeenCalledWith(...mockArgs);
    });

    it('should create a new dot plot chart if it does not exist in the chartRegistry', () => {
      const chart = new ReportsChart({});
      const mockDrawDotPlotChart = vi.fn();
      const mockArgs = ['arg1', 'arg2'];

      vi.spyOn(chart, 'getDotPlotChartArgs').mockReturnValue(mockArgs);
      vi.spyOn(chart, 'drawDotPlotChart').mockImplementation(mockDrawDotPlotChart);

      chart.updateDotPlotChart();

      expect(mockDrawDotPlotChart).toHaveBeenCalledWith(...mockArgs);
      expect(chart.chartRegistry.has(chartType.DOT_PLOT)).toBe(true);
    });

    it('should add the new dot plot chart to the chartRegistry with the correct key', () => {
      const chart = new ReportsChart({});
      const mockDrawDotPlotChart = vi.fn().mockReturnValue('mockDotPlotChart');
      vi.spyOn(chart, 'getDotPlotChartArgs').mockReturnValue([]);
      vi.spyOn(chart, 'drawDotPlotChart').mockImplementation(mockDrawDotPlotChart);

      chart.updateDotPlotChart();

      expect(chart.chartRegistry.get(chartType.DOT_PLOT)).toBe('mockDotPlotChart');
    });

    it('should call getDotPlotChartArgs to retrieve the arguments for the dot plot chart', () => {
      const chart = new ReportsChart({});
      const mockArgs = ['arg1', 'arg2'];
      const mockDrawDotPlotChart = vi.fn();

      vi.spyOn(chart, 'getDotPlotChartArgs').mockReturnValue(mockArgs);
      vi.spyOn(chart, 'drawDotPlotChart').mockImplementation(mockDrawDotPlotChart);

      chart.updateDotPlotChart();

      expect(chart.getDotPlotChartArgs).toHaveBeenCalled();
    });
  });

  describe('showTooltipFn', () => {
    it('should call showTooltip with correct parameters when event type is not "wheel" and isIOS is false', () => {
      navigator.userAgentData = { platform: 'NotMac' };
      const chart = new ReportsChart({});
      const mockEvent = { type: 'mousemove' };
      const mockData = { key: 'value' };
      const mockTooltipHTMLFunc = vi.fn();
      vi.spyOn(chart, 'tooltipHTMLFunc').mockReturnValue(mockTooltipHTMLFunc);

      chart.showTooltipFn(mockEvent, mockData);

      expect(mocks.showTooltip).toHaveBeenCalledWith({
        params: {
          ...mockData,
          tooltipHTMLFunc: mockTooltipHTMLFunc,
          maxWidth: 'auto',
        },
      });
    });

    it('should call hideTooltip when event type is "wheel" and isIOS is true', () => {
      navigator.userAgentData = { platform: 'MacIntel' };
      const chart = new ReportsChart({});
      const mockEvent = { type: 'wheel' };
      const mockData = { key: 'value' };
      //   vi.spyOn(require('@/helpers/ios/DetectIOSTouch'), 'isIOS').mockReturnValue(true);

      chart.showTooltipFn(mockEvent, mockData);

      expect(mocks.hideTooltip).toHaveBeenCalled();
    });

    it('should not throw an error if data is undefined', () => {
      const chart = new ReportsChart({});
      const mockEvent = { type: 'mousemove' };
      const mockTooltipHTMLFunc = vi.fn();
      vi.spyOn(chart, 'tooltipHTMLFunc').mockReturnValue(mockTooltipHTMLFunc);
      expect(() => chart.showTooltipFn(mockEvent, undefined)).not.toThrow();
      expect(mocks.showTooltip).toHaveBeenCalledWith({
        params: {
          tooltipHTMLFunc: chart.tooltipHTMLFunc(),
          maxWidth: 'auto',
        },
      });
    });

    it('should not throw an error if event is undefined', () => {
      const chart = new ReportsChart({});
      const mockData = { key: 'value' };

      expect(() => chart.showTooltipFn(undefined, mockData)).not.toThrow();
      expect(mocks.hideTooltip).toHaveBeenCalled();
    });
  });

  describe('getTooltipData', () => {
    it('should return d.data if it exists', () => {
      const chart = new ReportsChart({});
      const input = { data: { key: 'value' } };

      const result = chart.getTooltipData(input);

      expect(result).toEqual({ key: 'value' });
    });

    it('should return d[0] if d.data does not exist but d[0] exists', () => {
      const chart = new ReportsChart({});
      const input = [{ key: 'value' }];

      const result = chart.getTooltipData(input);

      expect(result).toEqual({ key: 'value' });
    });

    it('should return null if neither d.data nor d[0] exist', () => {
      const chart = new ReportsChart({});
      const input = {};

      const result = chart.getTooltipData(input);

      expect(result).toBeNull();
    });

    it('should return null if d is undefined', () => {
      const chart = new ReportsChart({});
      const input = undefined;

      const result = chart.getTooltipData(input);

      expect(result).toBeNull();
    });

    it('should return null if d is null', () => {
      const chart = new ReportsChart({});
      const input = null;

      const result = chart.getTooltipData(input);

      expect(result).toBeNull();
    });
  });

  describe('barMaxWidth getter', () => {
    it('returns 200 if groupBy is empty or not set', () => {
      const chart = new ReportsChart({ groupBy: [] });
      expect(chart.barMaxWidth).toBe(200);

      const chart2 = new ReportsChart({});
      expect(chart2.barMaxWidth).toBe(200);
    });

    it('returns 200 if groupBy has one value', () => {
      const chart = new ReportsChart({ groupBy: ['group1'] });
      expect(chart.barMaxWidth).toBe(200);
    });

    it('returns 10000 if groupBy has more than one value', () => {
      const chart = new ReportsChart({ groupBy: ['group1', 'group2'] });
      expect(chart.barMaxWidth).toBe(10000);
    });

    it('returns 10000 if isSingleGroupedOEE is true', () => {
      const chart = new ReportsChart({ configType: configType.OEE, groupBy: ['group1'] });
      expect(chart.isSingleGroupedOEE).toBe(true);
      expect(chart.barMaxWidth).toBe(10000);
    });
  });

  test('that updateBottomAxis calls update on the bottom axis', () => {
    const chart = new ReportsChart({
      totals: [],
      groupBy: [],
    });
    const update = vi.fn();
    chart.bottomAxis = {
      update,
    };

    chart.updateBottomAxis();

    expect(update).toHaveBeenCalled();
  });

  describe('isTrendlineVisible', () => {
    it('returns false if trendlineData is not defined', () => {
      const chart = new ReportsChart({
        trendlineData: null,
      });

      expect(chart.isTrendlineVisible()).toBe(false);
    });

    it('returns false if trendlineData.intercept is not defined', () => {
      const chart = new ReportsChart({
        trendlineData: { intercept: null, slope: 0.4 },
      });

      expect(chart.isTrendlineVisible()).toBe(false);
    });

    it('returns false if trendlineData.slope is not defined', () => {
      const chart = new ReportsChart({
        trendlineData: { slope: null, intercept: 0.4 },
      });

      expect(chart.isTrendlineVisible()).toBe(false);
    });

    it('returns true if trendlineData.slope and trendlineData.intercept are defined', () => {
      const chart = new ReportsChart({
        trendlineData: { slope: 0.2, intercept: 0.4 },
      });

      expect(chart.isTrendlineVisible()).toBe(true);
    });
  });

  describe('updateTrendline', () => {
    it('should update the existing trendline if it exists in the chartRegistry', () => {
      const chart = new ReportsChart({});
      const mockUpdate = vi.fn();

      chart.trendLine = { update: mockUpdate };

      chart.updateTrendline();

      expect(mockUpdate).toHaveBeenCalledWith({ isVisible: chart.isTrendlineVisible(), trendlineData: chart.trendlineData });
    });
  });

  describe('disableTrendline', () => {
    it('adds trendline if opts.disableTrendline is false', () => {
      const chart = new ReportsChart({
        calculatedData: [],
        disableTrendline: false,
        groupBy: [],
        totals: { groups: [] },
        chartType: [chartType.LINE],
      });

      chart.draw();

      expect(chart.trendLine).toBeDefined();
    });

    it('does not add trendline if opts.disableTrendline is true', () => {
      const chart = new ReportsChart({
        calculatedData: [],
        disableTrendline: true,
        groupBy: [],
        totals: { groups: [] },
        chartType: [chartType.LINE],
      });

      chart.draw();

      expect(chart.trendLine).toBeUndefined();
    });
  });
});
