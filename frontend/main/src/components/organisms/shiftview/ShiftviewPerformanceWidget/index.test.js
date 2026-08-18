import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import performanceWidgetType from '@/constants/performanceWidgetType';
import {
  useShiftStore,
  useShiftviewTimelineStore,
  useDeviceStore,
  useStationStore,
  useProfileStore,
  useUserPreferencesStore,
} from '@/stores/index';

vi.mock('d3', async () => {
  const actual = await vi.importActual('d3');
  return {
    ...actual,
    select: vi.fn().mockReturnValue('selectedNode'),
  };
});

const propsDefault = {
  widgetSubType: performanceWidgetType.UNIT_PER_MINUTE,
};

const createWrapper = ({ props = propsDefault } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { id: 0, startTimeISO: '2020-01-01T00:00:00.000Z' };

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.timeline = [{}];
  timelineStore.currentBatch = { alternativeUnitId: 0 };
  timelineStore.batches = new Map();

  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = 0;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  const profileStore = useProfileStore(pinia);
  profileStore.timeFormat = {};
  profileStore.dateFormat = {};

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = { usePrimaryUnit: true };
  userPreferencesStore.isLoading = false;

  return shallowMount(index, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('ShiftviewPerformanceWidget', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2020, 3, 1));
  });

  afterAll(() => {
    vi.useRealTimers();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();
    wrapper.setData({ processedChartData: [{}] });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('zoomSliderValue watcher', () => {
    it('does nothing if chartInstance is not defined', () => {
      const wrapper = createWrapper();

      expect(() => wrapper.vm.$options.watch.zoomSliderValue.call(wrapper.vm, 5)).not.toThrow();
    });

    it('does nothing if chartInstance.zoomModule is not defined', () => {
      const wrapper = createWrapper();

      wrapper.vm.chartInstance = {};
      expect(() => wrapper.vm.$options.watch.zoomSliderValue.call(wrapper.vm, 5)).not.toThrow();
    });

    it('calls sliderToScale and zoom.scaleTo if chartInstance.zoomModule is defined', () => {
      const sliderToScaleMock = vi.fn().mockReturnValue(10);
      const scaleToMock = vi.fn();
      const nodeMock = vi.fn().mockReturnValue('selectedNode');
      const wrapper = createWrapper();

      wrapper.vm.chartInstance = {
        zoomModule: {
          sliderToScale: sliderToScaleMock,
          zoom: { scaleTo: scaleToMock },
          currentZoom: { node: nodeMock },
        },
      };

      wrapper.vm.$options.watch.zoomSliderValue.call(wrapper.vm, 5);
      expect(sliderToScaleMock).toHaveBeenCalledWith(5);
      expect(nodeMock).toHaveBeenCalled();
      expect(scaleToMock).toHaveBeenCalledWith('selectedNode', 10);
    });
  });

  describe('onChartZoom', () => {
    it('does not change zoomSliderValue if chartInstance is not defined', () => {
      const wrapper = createWrapper();

      wrapper.vm.zoomSliderValue = 5;
      wrapper.vm.onChartZoom(10);
      expect(wrapper.vm.zoomSliderValue).toBe(5);
    });

    it('does not change zoomSliderValue if chartInstance.zoomModule is not defined', () => {
      const wrapper = createWrapper();

      wrapper.vm.chartInstance = {};
      wrapper.vm.zoomSliderValue = 5;
      wrapper.vm.onChartZoom(10);
      expect(wrapper.vm.zoomSliderValue).toBe(5);
    });

    it('changes zoomSliderValue if chartInstance.zoomModule is defined', () => {
      const wrapper = createWrapper();

      wrapper.vm.chartInstance = {
        zoomModule:
        {
          scaleToSlider: vi.fn().mockReturnValue(10),
          sliderToScale: vi.fn(),
          zoom: { scaleTo: vi.fn() },
          currentZoom: { node: vi.fn() },
        },
      };
      wrapper.vm.zoomSliderValue = 5;
      wrapper.vm.onChartZoom(10);
      expect(wrapper.vm.zoomSliderValue).toBe(10);
    });
  });
});
