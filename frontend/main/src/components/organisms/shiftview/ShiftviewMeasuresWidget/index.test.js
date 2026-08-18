import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';

import widgetsApi from '@/api/widgetsApi';
import MeasuresWidget from '@/components/organisms/shiftview/ShiftviewMeasuresWidget/index.vue';
import {
  useStationStore,
  useShiftStore,
  useShiftviewTimelineStore,
  useDeviceStore,
} from '@/stores/index';

vi.mock('@/api/widgetsApi');
const getMeasures = vi.fn();
widgetsApi.getMeasures = getMeasures;

const defaultProps = {
  config: { measures: { measureName: 'name' } },
};

const createWrapper = ({ props = defaultProps, shift = { startTime: '2020-02-02T00:00:00', endTime: '2020-02-02T12:00:00' } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { id: 13, zoneId: 'Europe/Tallinn' };

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = shift;

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.currentBatch = { productionOrder: 'test order' };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isBrowserTabActive = true;

  return shallowMount(MeasuresWidget, {
    global: { plugins: [pinia] },
    data() {
      return {
        measuresData: [{
          currentName: 'test1', measureUnit: 'kg', currentValue: 15.567, prevValue: 14.12,
        }],
      };
    },
    propsData: props,
  });
};

describe('ShiftviewMeasuresWidget', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that widgetsApi.getMeasures is called on mount and it queries measures with correct params if shift endTime is in the past', () => {
    createWrapper();

    expect(getMeasures).toHaveBeenCalledTimes(1);
    expect(getMeasures).toHaveBeenCalledWith(13, 'name', 'test order', '2020-02-02T12:00:00', '2020-02-02T00:00:00', true);
  });

  test('that widgetsApi.getMeasures is called on mount and it queries measures with correct params if shift is running', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-28T16:21:36'));

    const endTime = DateTime.local().plus({ hour: 1 }).setZone('Europe/Tallinn').toFormat("yyyy-MM-dd'T'HH:mm:ss");
    createWrapper({ shift: { startTime: '2020-02-02T00:00:00', endTime } });

    expect(getMeasures).toHaveBeenCalledTimes(1);
    expect(getMeasures).toHaveBeenCalledWith(
      13,
      'name',
      'test order',
      DateTime.local().setZone('Europe/Tallinn').toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      '2020-02-02T00:00:00',
      true,
    );
  });

  test('that widgetsApi.getMeasures is called on mount and it queries measures with correct params', () => {
    const props = { config: { measures: { measureName: 'name' }, singleValue: true } };
    createWrapper({ props });

    expect(getMeasures).toHaveBeenCalledTimes(1);
    expect(getMeasures).toHaveBeenCalledWith(13, 'name', 'test order', '2020-02-02T12:00:00', '2020-02-02T00:00:00', false);
  });

  test('that modifyMeasures returns expected result', () => {
    const wrapper = createWrapper();

    const measures = [
      { measureName: 'test1', measureUnit: 'kg', measureValue: 15.567 },
      { measureName: 'test1', measureUnit: 'kg', measureValue: 14.12 },
      { measureName: 'test2', measureUnit: 'l', measureValue: 3 },
      { measureName: 'test2', measureUnit: 'l', measureValue: 1 },
    ];

    const result = wrapper.vm.modifyMeasures(measures);
    expect(result).toEqual([
      {
        currentName: 'test1', measureUnit: 'kg', currentValue: 15.567, prevValue: 14.12,
      },
      {
        currentName: 'test2', measureUnit: 'l', currentValue: 3, prevValue: 1,
      },
    ]);
  });
});
