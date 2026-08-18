import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import DashboardWidget from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';

const stationsList = [
  { id: 1, name: 'test station 1', factoryId: 1 },
  { id: 2, name: 'test station 2', factoryId: 1 },
  { id: 3, name: 'test station 3', factoryId: 2 },
  { id: 4, name: 'test station 4', factoryId: 2 },
];

const defaultInitialState = {
  station: {
    stations: stationsList,
  },
  device: {
    isBrowserTabActive: true,
  },
};

const defaultProps = {
  widget: {
    config: {
      stationId: [1], widgetName: 'test widget', periodName: 'thisyear',
    },
    x: 1,
    y: 1,
    w: 1,
    h: 1,
    i: 1,
  },
  layout: [],
  updateTrigger: 1,
};

const createWrapper = (props = defaultProps, initialState = defaultInitialState) => shallowMount(DashboardWidget, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState,
      }),
    ],
  },
  props,
});

describe('DashboardWidget', () => {
  vi.useFakeTimers();

  test('that widgetFetchDataInterval is set on mounted', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.widgetFetchDataInterval).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.widgetFetchDataInterval.cbFun).toBe(wrapper.vm.updateWidgetFetchDataTrigger);
    expect(wrapper.vm.widgetFetchDataInterval.delay).toBe(5 * 60 * 1000);
  });

  test('that updateWidgetFetchDataTrigger is updated after every 5 minutes', () => {
    const wrapper = createWrapper();

    const spy = vi.spyOn(wrapper.vm.widgetFetchDataInterval, 'cbFun');
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('that widgetFetchDataInterval is cleared on unmount and updateWidgetFetchDataTrigger is not called after that', async () => {
    const wrapper = createWrapper();
    await nextTick();
    const spy = vi.spyOn(wrapper.vm.widgetFetchDataInterval, 'cbFun');

    wrapper.unmount();
    expect(wrapper.vm.widgetFetchDataInterval).toBe(null);

    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(spy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('that widget has correct title, when widget measure is qty', () => {
    const wrapper = createWrapper({
      ...defaultProps,
      widget: {
        config: {
          stationId: [1], measure: 'qty', periodName: 'thisyear',
        },
        x: 1,
        y: 1,
        w: 1,
        h: 1,
        i: 1,
      },
      layout: [],
    });

    expect(wrapper.vm.oeeChartTitle).toBe('Total quantity');
  });

  test('that widget has correct title, when widget measure is goodqty', () => {
    const wrapper = createWrapper({
      ...defaultProps,
      widget: {
        config: {
          stationId: [1], measure: 'goodqty', periodName: 'thisyear',
        },
        x: 1,
        y: 1,
        w: 1,
        h: 1,
        i: 1,
      },
      layout: [],
    });

    expect(wrapper.vm.oeeChartTitle).toBe('Good quantity');
  });

  describe('widgetPeriod', () => {
    it('returns date range if widget period is custom', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        widget: {
          config: {
            stationId: [1], widgetName: 'name', periodName: 'custom', range: { start: '2023-01-01', end: '2023-01-31' },
          },
          x: 1,
          y: 1,
          w: 1,
          h: 1,
          i: 1,
        },
        layout: [],
      });

      expect(wrapper.vm.widgetPeriod).toBe('01.01.2023 - 31.01.2023');
    });
    it('returns period from widget periodName', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        widget: {
          config: {
            stationId: [1], widgetName: 'name', periodName: 'rolling7shifts',
          },
          x: 1,
          y: 1,
          w: 1,
          h: 1,
          i: 1,
        },
        layout: [],
      });

      expect(wrapper.vm.widgetPeriod).toBe('Last 7 shifts');
    });
  });

  describe('widgetStations', () => {
    it('returns correct stations when widget has stations selected', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        widget: {
          config: {
            stationId: [1, 2, 3], widgetName: 'test widget', periodName: 'thisyear',
          },
          x: 1,
          y: 1,
          w: 1,
          h: 1,
          i: 1,
        },
        layout: [],
      });

      expect(wrapper.vm.widgetStations).toEqual([
        { id: 1, name: 'test station 1', factoryId: 1 },
        { id: 2, name: 'test station 2', factoryId: 1 },
        { id: 3, name: 'test station 3', factoryId: 2 },
      ]);
    });

    it('returns all factory stations when widget has no stations selected, but has factory selected', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        widget: {
          config: {
            stationId: [], factoryId: [1], widgetName: 'test widget', periodName: 'thisyear',
          },
          x: 1,
          y: 1,
          w: 1,
          h: 1,
          i: 1,
        },
        layout: [],
      });

      expect(wrapper.vm.widgetStations).toEqual([
        { id: 1, name: 'test station 1', factoryId: 1 },
        { id: 2, name: 'test station 2', factoryId: 1 },
      ]);
    });

    it('returns all stations when widget has no stations or factory selected', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        widget: {
          config: {
            stationId: [], factoryId: [], widgetName: 'test widget', periodName: 'thisyear',
          },
          x: 1,
          y: 1,
          w: 1,
          h: 1,
          i: 1,
        },
        layout: [],
      });

      expect(wrapper.vm.widgetStations).toEqual([
        { id: 1, name: 'test station 1', factoryId: 1 },
        { id: 2, name: 'test station 2', factoryId: 1 },
        { id: 3, name: 'test station 3', factoryId: 2 },
        { id: 4, name: 'test station 4', factoryId: 2 },
      ]);
    });
  });
});
