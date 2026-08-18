import { shallowMount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ChecklistWidget from './index';

import statisticsApi from '@/api/statisticsApi';
import BarChartHorizontal from '@/components/atoms/BarChartHorizontal/BarChartHorizontal.js';
import BarChartVertical from '@/components/atoms/BarChartVertical/BarChartVertical.js';
import { requestWidgetViewTypes } from '@/constants/widgetViewTypes';
import displayModes from '@/constants/checklistWidgetDisplayModes';
import colorConstants from '@/constants/colorConstants';

vi.mock('@/api/statisticsApi');
statisticsApi.getOeeWidgetData = vi.fn();

vi.mock('@/components/atoms/BarChartHorizontal/BarChartHorizontal.js', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/atoms/BarChartVertical/BarChartVertical.js', () => ({
  default: vi.fn(),
}));

vi.mock('@/helpers/numbers/formatNumber', () => ({
  formatPercentage: (n) => `${n}%`,
}));

const pinia = createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    profile: {
      dateFormat: { long: 'dd.MM.yyyy', short: 'dd.MM' },
    },
  },
});

const global = {
  plugins: [pinia],
};

const defaultProps = {
  config: {
    factoryId: 1,
    stationId: 1,
    entityIds: [],
    periodName: 'day',
    top: 10,
    range: null,
    displayType: displayModes.CHECKLIST,
    viewBy: 'checklists',
  },
  updateTrigger: 0,
  fetchTrigger: 0,
  i: 0,
};

const createWrapper = (propsOverride = {}) => shallowMount(ChecklistWidget, {
  global,
  props: { ...defaultProps, ...propsOverride },
});

const mockChecklistApiResponse = {
  results: [
    {
      valueLabel: 'Checklist A',
      totalcheckcount: 100,
      successfulcheckcount: 60,
      unsuccessfulcheckcount: 20,
      missedcheckcount: 15,
      newcheckcount: 5,
    },
    {
      valueLabel: 'Checklist B',
      totalcheckcount: 50,
      successfulcheckcount: 30,
      unsuccessfulcheckcount: 10,
      missedcheckcount: 8,
      newcheckcount: 2,
    },
  ],
};

const mockTimelineApiResponse = {
  granularity: 'date',
  results: [
    {
      valueLabel: 'Day 1',
      date: '2024-06-03',
      totalcheckcount: 80,
      successfulcheckcount: 50,
      unsuccessfulcheckcount: 15,
      missedcheckcount: 10,
      newcheckcount: 5,
    },
  ],
};

describe('ChecklistWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statisticsApi.getOeeWidgetData.mockReturnValue(new Promise(() => {}));
  });

  describe('snapshots', () => {
    it('renders loading state while fetching', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders no data state when API returns empty results', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce({ results: [] });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders chart state when API returns data', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockChecklistApiResponse);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('fetchChecklistData', () => {
    it('calls getOeeWidgetData with correct params for checklist displayType', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockChecklistApiResponse);
      createWrapper();
      await flushPromises();

      expect(statisticsApi.getOeeWidgetData).toHaveBeenCalledWith({
        factoryIds: defaultProps.config.factoryId,
        stationIds: defaultProps.config.stationId,
        entityIds: defaultProps.config.entityIds,
        measure: 'totalcheckcount',
        periodName: defaultProps.config.periodName,
        top: defaultProps.config.top,
        range: defaultProps.config.range,
        displayType: displayModes.CHECKLIST,
        viewBy: requestWidgetViewTypes[defaultProps.config.viewBy],
      });
    });

    it('calls getOeeWidgetData with correct params for timeline displayType', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const timelineConfig = {
        ...defaultProps.config,
        displayType: displayModes.TIMELINE,
        viewBy: 'groups',
      };
      createWrapper({ config: timelineConfig });
      await flushPromises();

      expect(statisticsApi.getOeeWidgetData).toHaveBeenCalledWith({
        factoryIds: timelineConfig.factoryId,
        stationIds: timelineConfig.stationId,
        entityIds: timelineConfig.entityIds,
        measure: 'totalcheckcount',
        periodName: timelineConfig.periodName,
        top: timelineConfig.top,
        range: timelineConfig.range,
        displayType: displayModes.TIMELINE,
        viewBy: requestWidgetViewTypes.groups,
      });
    });

    it('sets chartData to empty array on API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      statisticsApi.getOeeWidgetData.mockRejectedValueOnce(new Error('Network error'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.$.setupState.chartData).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('sets loading to false after successful fetch', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockChecklistApiResponse);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.$.setupState.loading).toBe(false);
    });

    it('sets loading to false after failed fetch', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      statisticsApi.getOeeWidgetData.mockRejectedValueOnce(new Error('Error'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.$.setupState.loading).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getGranularityLabel', () => {
    it.each([
      ['checklists', 'Checklist'],
      ['groups', 'Checklist group'],
      ['date', 'Day'],
      ['shift', 'Shift'],
      ['month', 'Month'],
      ['weekofyear', 'Week'],
      ['year', 'year'],
    ])('returns "%s" for granularity "%s"', (granularity, expected) => {
      const wrapper = createWrapper();

      expect(wrapper.vm.$.setupState.getGranularityLabel(granularity)).toBe(expected);
    });

    it('returns the granularity itself for unknown values', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.$.setupState.getGranularityLabel('unknown')).toBe('unknown');
    });
  });

  describe('formatChecklistData', () => {
    it('maps data with correct structure', () => {
      const wrapper = createWrapper();
      const { formatChecklistData } = wrapper.vm.$.setupState;

      const res = formatChecklistData(mockChecklistApiResponse);

      expect(res[0]).toMatchObject({
        measureLabel: 'Checklist A',
        tooltipMeasureLabel: 'Checklist A',
        granularityLabel: 'Checklist',
        value: 100,
        measure: 100,
      });
    });

    it('builds stackList with all 4 check types and correct values', () => {
      const wrapper = createWrapper();
      const { formatChecklistData } = wrapper.vm.$.setupState;

      const { stackList } = formatChecklistData(mockChecklistApiResponse)[0];
      expect(stackList).toHaveLength(4);
      expect(stackList[0]).toMatchObject({ measure: 60, value: 60, color: colorConstants.dark['lw-green'], label: 'Successful' });
      expect(stackList[1]).toMatchObject({ measure: 20, value: 20, color: colorConstants.dark['lw-orange'], label: 'Unsuccessful' });
      expect(stackList[2]).toMatchObject({ measure: 15, value: 15, color: colorConstants.dark['lw-red'], label: 'Missed' });
      expect(stackList[3]).toMatchObject({ measure: 5, value: 5, color: colorConstants.dark['secondary-dark'], label: 'New' });
    });
  });

  describe('formatTimelineData', () => {
    it('returns items with correct structure for date granularity', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      const { formatTimelineData } = wrapper.vm.$.setupState;
      const res = formatTimelineData(mockTimelineApiResponse);
      expect(res[0]).toMatchObject({
        granularityLabel: 'Day',
        value: 80,
        measure: 'Day 1',
        measureLabel: '03',
      });
    });

    it('uses valueLabel+index as measure for shift granularity', async () => {
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      const { formatTimelineData } = wrapper.vm.$.setupState;
      const res = formatTimelineData({
        granularity: 'shift',
        results: [
          {
            valueLabel: 'Morning',
            date: '2024-06-03',
            totalcheckcount: 50,
            successfulcheckcount: 30,
            unsuccessfulcheckcount: 10,
            missedcheckcount: 5,
            newcheckcount: 5,
          },
        ],
      });
      expect(res[0].measure).toBe('Morning0');
      expect(res[0].measureLabel).toBe('Morning');
    });

    it('marks weekend dates as isAreaHighlighted for date granularity', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce({
        granularity: 'date',
        results: [
          {
            valueLabel: 'Saturday',
            date: '2024-06-22', // Saturday
            totalcheckcount: 10,
            successfulcheckcount: 5,
            unsuccessfulcheckcount: 2,
            missedcheckcount: 2,
            newcheckcount: 1,
          },
        ],
      });
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      expect(wrapper.vm.$.setupState.chartData[0].isAreaHighlighted).toBe(true);
    });

    it('does not mark non-weekend dates as isAreaHighlighted', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      expect(wrapper.vm.$.setupState.chartData[0].isAreaHighlighted).toBe(false);
    });

    it('does not highlight isAreaHighlighted for shift granularity', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce({
        granularity: 'shift',
        results: [
          {
            valueLabel: 'Morning',
            date: '2024-06-22', // Saturday - but isAreaHighlighted only applies to 'date' granularity
            totalcheckcount: 10,
            successfulcheckcount: 5,
            unsuccessfulcheckcount: 2,
            missedcheckcount: 2,
            newcheckcount: 1,
          },
        ],
      });
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      expect(wrapper.vm.$.setupState.chartData[0].isAreaHighlighted).toBe(false);
    });

    it('builds cumulative stackList arrays with correct start and end values', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      const { stackList } = wrapper.vm.$.setupState.chartData[0];
      expect(stackList[0][0]).toBe(0);
      expect(stackList[0][1]).toBe(50); // successful: 0 → 50
      expect(stackList[1][0]).toBe(50);
      expect(stackList[1][1]).toBe(65); // unsuccessful: 50 → 65
      expect(stackList[2][0]).toBe(65);
      expect(stackList[2][1]).toBe(75); // missed: 65 → 75
      expect(stackList[3][0]).toBe(75);
      expect(stackList[3][1]).toBe(80); // new: 75 → 80
    });

    it('attaches .data property to each stackList array', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      const { stackList } = wrapper.vm.$.setupState.chartData[0];
      expect(stackList[0].data).toMatchObject({ value: 50, label: 'Successful', color: colorConstants.dark['lw-green'] });
      expect(stackList[1].data).toMatchObject({ value: 15, label: 'Unsuccessful' });
      expect(stackList[2].data).toMatchObject({ value: 10, label: 'Missed' });
      expect(stackList[3].data).toMatchObject({ value: 5, label: 'New' });
    });
  });

  describe('tooltipHTMLFunc', () => {
    it('returns HTML containing granularity label, measure label, and total count', () => {
      const wrapper = createWrapper();
      const { tooltipHTMLFunc } = wrapper.vm.$.setupState;
      const data = {
        granularityLabel: 'Checklist',
        tooltipMeasureLabel: 'My Checklist',
        value: 100,
        stackList: [
          { value: 60, color: colorConstants.dark['lw-green'], label: 'Successful' },
          { value: 20, color: colorConstants.dark['lw-orange'], label: 'Unsuccessful' },
          { value: 15, color: colorConstants.dark['lw-red'], label: 'Missed' },
          { value: 5, color: colorConstants.dark['secondary-dark'], label: 'New' },
        ],
      };

      const html = tooltipHTMLFunc(data);
      expect(html).toContain('Checklist');
      expect(html).toContain('My Checklist');
      expect(html).toContain('Count');
      expect(html).toContain('100');
    });

    it('includes each stack item label and value in the output', () => {
      const wrapper = createWrapper();
      const { tooltipHTMLFunc } = wrapper.vm.$.setupState;
      const data = {
        granularityLabel: 'Day',
        tooltipMeasureLabel: 'June 3',
        value: 80,
        stackList: [
          { value: 50, color: '#0AAC00', label: 'Successful' },
          { value: 15, color: '#F28A0D', label: 'Unsuccessful' },
          { value: 10, color: '#E01C21', label: 'Missed' },
          { value: 5, color: '#707070', label: 'New' },
        ],
      };

      const html = tooltipHTMLFunc(data);
      expect(html).toContain('Successful');
      expect(html).toContain('50');
      expect(html).toContain('Unsuccessful');
      expect(html).toContain('15');
    });

    it('reads stack item values from .data property for timeline stack items', () => {
      const wrapper = createWrapper();
      const { tooltipHTMLFunc } = wrapper.vm.$.setupState;

      const stackItem = [0, 60];
      stackItem.data = { value: 60, color: colorConstants.dark['lw-green'], label: 'Successful' };

      const data = {
        granularityLabel: 'Day',
        tooltipMeasureLabel: 'June 3',
        value: 100,
        stackList: [stackItem],
      };

      const html = tooltipHTMLFunc(data);
      expect(html).toContain('Successful');
      expect(html).toContain('60');
    });
  });

  describe('drawChart', () => {
    it('creates BarChartHorizontal when displayType is checklist and chartEl is set', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockChecklistApiResponse);
      const wrapper = createWrapper();
      await flushPromises();

      const { setupState } = wrapper.vm.$;
      const chartEl = document.createElement('div');
      setupState.chartEl = chartEl;
      setupState.drawChart();

      expect(BarChartHorizontal).toHaveBeenCalledWith(expect.objectContaining({
        data: setupState.chartData,
        element: chartEl,
        isStacked: true,
        isDark: true,
        tooltipHTMLFunc: expect.any(Function),
      }));
    });

    it('creates BarChartVertical when displayType is timeline and chartEl is set', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValueOnce(mockTimelineApiResponse);
      const wrapper = createWrapper({
        config: { ...defaultProps.config, displayType: displayModes.TIMELINE },
      });
      await flushPromises();

      const { setupState } = wrapper.vm.$;
      const chartEl = document.createElement('div');
      setupState.chartEl = chartEl;
      setupState.drawChart();

      expect(BarChartVertical).toHaveBeenCalledWith(expect.objectContaining({
        data: setupState.chartData,
        element: chartEl,
        isStacked: true,
        isDark: true,
        isRounded: true,
        areaHighlightsEnabled: true,
        gradientColor: colorConstants.dark['lw-background'],
        tooltipHTMLFunc: expect.any(Function),
      }));
    });
  });

  describe('watcher', () => {
    it('refetches data when updateTrigger changes', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValue(mockChecklistApiResponse);
      const wrapper = createWrapper();
      await flushPromises();

      vi.clearAllMocks();
      statisticsApi.getOeeWidgetData.mockResolvedValue(mockChecklistApiResponse);
      await wrapper.setProps({ updateTrigger: 1 });
      await flushPromises();

      expect(statisticsApi.getOeeWidgetData).toHaveBeenCalledTimes(1);
    });

    it('refetches data when fetchTrigger changes', async () => {
      statisticsApi.getOeeWidgetData.mockResolvedValue(mockChecklistApiResponse);
      const wrapper = createWrapper();
      await flushPromises();

      vi.clearAllMocks();
      statisticsApi.getOeeWidgetData.mockResolvedValue(mockChecklistApiResponse);
      await wrapper.setProps({ fetchTrigger: 1 });
      await flushPromises();

      expect(statisticsApi.getOeeWidgetData).toHaveBeenCalledTimes(1);
    });
  });
});
