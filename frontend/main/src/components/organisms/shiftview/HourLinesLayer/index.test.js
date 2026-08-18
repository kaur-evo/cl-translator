import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CommentPath from './CommentPath';

import HourLinesLayer from '@/components/organisms/shiftview/HourLinesLayer/index.vue';
import {
  useShiftviewTimelineStore,
  useShiftviewSelectionStore,
  useShiftStore,
  useStationStore,
} from '@/stores/index';

vi.mock('./CommentPath.vue', () => ({
  getPath: vi.fn(() => 'mocked-path'),
}));

const emptySlicesByType = {
  products: [],
  uncommented: [],
  commented: [],
  plannedExclInOee: [],
  plannedInclInOee: [],
  planned: [],
};

const createWrapper = ({ slicesByType = emptySlicesByType, timeline = [] } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.yellowSlices = [];
  timelineStore.performanceLossTimeline = [];
  timelineStore.slicesByType = slicesByType;
  timelineStore.timeline = timeline;

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.isSelectionActive = false;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { startTime: '2020-09-12T12:00:00', endTime: '2020-09-12T17:00:00' };

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  return shallowMount(HourLinesLayer, {
    global: { plugins: [pinia] },
  });
};

describe('HourLinesLayer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('that getSliceByTime returns correct slice', () => {
    const slices = [
      {
        id: 1, sliceStartTmISO: '2020-09-12T12:00:00.000Z', sliceEndTmISO: '2020-09-12T12:02:00.000Z', type: 'PRODUCT',
      },
      {
        id: 2, sliceStartTmISO: '2020-09-12T12:02:00.000Z', sliceEndTmISO: '2020-09-12T12:05:00.000Z', type: 'STOPPAGE',
      },
      {
        id: 3, sliceStartTmISO: '2020-09-12T12:05:00.000Z', sliceEndTmISO: '2020-09-12T12:06:00.000Z', type: 'PRODUCT',
      },
      {
        id: 4, sliceStartTmISO: '2020-09-12T13:06:00.000Z', sliceEndTmISO: '2020-09-12T13:09:00.000Z', type: 'STOPPAGE',
      },
      {
        id: 5, sliceStartTmISO: '2020-09-12T13:09:00.000Z', sliceEndTmISO: '2020-09-12T13:11:00.000Z', type: 'PRODUCT',
      },
      {
        id: 6, sliceStartTmISO: '2020-09-12T13:11:00.000Z', sliceEndTmISO: '2020-09-12T14:50:00.000Z', type: 'PRODUCT',
      },
      {
        id: 7, sliceStartTmISO: '2020-09-12T14:50:00.000Z', sliceEndTmISO: '2020-09-12T14:51:00.000Z', type: 'PRODUCT',
      },
      {
        id: 8, sliceStartTmISO: '2020-09-12T14:51:00.000Z', sliceEndTmISO: '2020-09-12T15:00:00.000Z', type: 'PRODUCT',
      },
      {
        id: 9, sliceStartTmISO: '2020-09-12T15:00:00.000Z', sliceEndTmISO: '2020-09-12T15:01:00.000Z', type: 'PRODUCT',
      },
    ];
    const wrapper = createWrapper({
      slicesByType: {
        products: slices.filter((slice) => slice.type === 'PRODUCT'),
        uncommented: slices.filter((slice) => slice.type === 'STOPPAGE'),
        commented: [],
        plannedExclInOee: [],
        plannedInclInOee: [],
        planned: [],
      },
      timeline: slices,
    });

    expect(wrapper.vm.getSliceByTime('2020-09-12T12:00:00.000Z')).toEqual(slices[0]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T12:05:10.000Z')).toEqual(slices[2]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T13:10:10.000Z')).toEqual(slices[4]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T14:50:30.000Z')).toEqual(slices[6]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T15:00:10.000Z')).toEqual(slices[8]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T12:02:10.000Z')).toEqual(slices[1]);
    expect(wrapper.vm.getSliceByTime('2020-09-12T17:09:10.000Z')).toEqual(undefined);
  });

  describe('onBatchHover', () => {
    it('sets batchHoverPath to empty string if input is null', async () => {
      const wrapper = createWrapper();

      await wrapper.setData({ batchHoverPath: 'some-path' });

      wrapper.vm.onBatchHover(null);
      expect(wrapper.vm.batchHoverPath).toBe('');
    });

    it('sets batchHoverPath', async () => {
      const wrapper = createWrapper();

      vi.spyOn(CommentPath.prototype, 'getPath').mockReturnValue('mocked-path');

      wrapper.vm.onBatchHover(1);

      expect(wrapper.vm.batchHoverPath).toBe('mocked-path');
    });
  });

  describe('lifecycle hooks', () => {
    it('clears timeout and removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const wrapper = createWrapper();

      wrapper.unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
  });

  describe('onWidgetChartHover', () => {
    it('clears performanceHoverPath when time is null', () => {
      const wrapper = createWrapper();

      wrapper.vm.performanceHoverPath = 'some-path';
      wrapper.vm.onWidgetChartHover(null);

      expect(wrapper.vm.performanceHoverPath).toBe('');
    });

    it('sets performanceHoverPath when time is provided', () => {
      const slices = [
        {
          id: 1, sliceStartTmISO: '2020-09-12T12:00:00.000Z', sliceEndTmISO: '2020-09-12T12:02:00.000Z', type: 'PRODUCT',
        },
      ];
      const wrapper = createWrapper({
        slicesByType: {
          products: slices,
          uncommented: [],
          commented: [],
          plannedExclInOee: [],
          plannedInclInOee: [],
          planned: [],
        },
        timeline: slices,
      });

      vi.spyOn(CommentPath.prototype, 'getPath').mockReturnValue('performance-hover-path');

      wrapper.vm.onWidgetChartHover('2020-09-12T12:01:00.000Z');

      expect(wrapper.vm.performanceHoverPath).toBe('performance-hover-path');
    });
  });
});
