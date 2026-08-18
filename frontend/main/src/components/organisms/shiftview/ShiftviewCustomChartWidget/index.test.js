import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import ProductSpeedWidgetBase from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import widgetsApi from '@/api/widgetsApi';
import {
  useStationStore,
  useDeviceStore,
  useShiftStore,
  useProfileStore,
} from '@/stores/index';

vi.mock('@/api/widgetsApi');
widgetsApi.getMetrics = () => ([]);

const createWrapper = ({ config = { updateInterval: 5 } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { id: 2, zoneId: 'Europe/Tallinn' };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = 100;
  deviceStore.isBrowserTabActive = true;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = {};

  const profileStore = useProfileStore(pinia);
  profileStore.timeFormat = { luxonLong: 'HH:mm:ss' };

  return mount(ProductSpeedWidgetBase, {
    propsData: { config },
    global: { plugins: [pinia] },
  });
};

describe('ShiftviewCustomChartWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  test('that interval is set on mount', async () => {
    const wrapper = createWrapper();

    await nextTick();

    expect(wrapper.vm.intervalRef).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.intervalRef.cbFun).toBe(wrapper.vm.fetchMetricsData);
    expect(wrapper.vm.intervalRef.delay).toBe(wrapper.vm.updateInterval);
    const spy = vi.spyOn(wrapper.vm.intervalRef, 'cbFun');
    const passedIntervals = 7;
    vi.advanceTimersByTime(passedIntervals * wrapper.vm.updateInterval);
    expect(spy).toHaveBeenCalledTimes(passedIntervals);
  });

  test('that interval is cleared on destroy', async () => {
    const wrapper = createWrapper();

    await nextTick();

    const spy = vi.spyOn(wrapper.vm.intervalRef, 'cbFun');
    wrapper.unmount();
    expect(wrapper.vm.intervalRef).toBe(null);
    const passedIntervals = 7;
    vi.advanceTimersByTime(passedIntervals * wrapper.vm.updateInterval);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('maps metrics data to chart data', () => {
    const wrapper = createWrapper({ config: { updateInterval: 5, dataPoints: ['measure 1', 'measure 2'] } });

    const metricsResult = [
      {
        eventTimeISO: '2024-01-12T01:59:00.000+02:00',
        measureUnit: 'unit 1',
        measureValue: 0.5,
        measureName: 'measure 1',
      },
      {
        eventTimeISO: '2024-01-12T02:00:00.000+02:00',
        measureUnit: 'unit 1',
        measureValue: 0.6,
        measureName: 'measure 1',
      },
      {
        eventTimeISO: '2024-01-12T02:01:00.000+02:00',
        measureUnit: 'unit 2',
        measureValue: 0.7,
        measureName: 'measure 2',
      },
      {
        eventTimeISO: '2024-01-12T02:01:00.000+02:00',
        measureUnit: 'unit 1',
        measureValue: 0.5,
        measureName: 'measure 1',
      },
    ];

    const mappedResult = wrapper.vm.mapResult(metricsResult);
    expect(mappedResult).toEqual([
      {
        'measure 1': 0.5,
        'measure 1Label': '0,5unit 1',
        'measure 2': 0,
        'measure 2Label': 0,
        measureLabel: '01:59:00',
        time: '2024-01-12T01:59:00.000+02:00',
        measure: new Date('2024-01-12T01:59:00.000+02:00'),
      },
      {
        'measure 1': 0.6,
        'measure 1Label': '0,6unit 1',
        'measure 2': 0,
        'measure 2Label': 0,
        measureLabel: '02:00:00',
        time: '2024-01-12T02:00:00.000+02:00',
        measure: new Date('2024-01-12T02:00:00.000+02:00'),
      },
      {
        'measure 1': 0.5,
        'measure 1Label': '0,5unit 1',
        'measure 2': 0.7,
        'measure 2Label': '0,7unit 2',
        measureLabel: '02:01:00',
        time: '2024-01-12T02:01:00.000+02:00',
        measure: new Date('2024-01-12T02:01:00.000+02:00'),
      },
    ]);
  });
});
