import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import PerformanceLossSlice from '@/components/organisms/shiftview/PerformanceLossSlice/index.vue';
import {
  useStationStore,
  usePerfCommentStore,
  useShiftviewTimelineStore,
  useShiftviewSelectionStore,
  usePositionStore,
  useDeviceStore,
} from '@/stores/index';

const defaultPerformanceLossTimeline = [{
  commentId: 1,
  positionId: 1,
  batchId: 1,
  startTimeISO: '2023-03-10T12:08:00.000Z',
  endTimeISO: '2023-03-10T12:11:00.000Z',
  notes: 'speed loss extra note',
}];

const createWrapper = ({
  options = {},
  performanceLossTimeline = defaultPerformanceLossTimeline,
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  const perfCommentStore = usePerfCommentStore(pinia);
  perfCommentStore.perfCommentsList = [{ id: 1, groupId: 1, name: 'perf comment 1' }];
  perfCommentStore.perfCommentGroupsList = [{ id: 1, name: 'group 1' }];

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.batches = new Map([[1, {
    id: 1, unitId: 'unit', productName: 'product 1', productSku: '22', cycleTimeGood: 60,
  }]]);
  shiftviewTimelineStore.performanceLossTimeline = performanceLossTimeline;

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.shiftviewSelectionType = null;

  const positionStore = usePositionStore(pinia);
  positionStore.positions = [{ id: 1, name: 'position 1' }];

  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = 0;

  return shallowMount(PerformanceLossSlice, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  slice: {
    parent: {
      id: 1,
      batchId: 1,
      sliceStartTmISO: '2023-03-10T12:08:00.000Z',
      sliceEndTmISO: '2023-03-10T12:11:00.000Z',
    },
    startSecond: 0,
    endSecond: 180,
    elementDuration: 180,
  },
};

describe('PerformanceLossSlice', () => {
  it('renders', () => {
    const wrapper = createWrapper({
      options: { props: { ...propsDefault } },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      options: { props: { ...propsDefault } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('tooltipRows', () => {
    const wrapper = createWrapper({
      options: { props: { ...propsDefault } },
    });

    wrapper.setData({
      tooltipProps: {
        slice: {
          parent: {
            commentId: 1,
            positionId: 1,
            batchId: 1,
            sliceStartTmISO: '2023-03-10T12:08:00.000Z',
            sliceEndTmISO: '2023-03-10T12:11:00.000Z',
            notes: 'speed loss extra note',
          },
        },
      },
    });

    expect(wrapper.vm.tooltipRows).toEqual([
      { key: 'Group', value: 'group 1' },
      { key: 'Start', value: '12:08 (3m)' },
      { key: 'Product', value: 'product 1 (22)' },
      { key: 'Machine location', value: 'position 1' },
      { key: 'Loss', value: '3 unit', valueClass: 'text-secondary' },
      { key: 'Extra note', value: 'speed loss extra note', allowTextWrap: true },
    ]);
  });

  test('that getCurrentTimelineElem returns correct timeline', () => {
    const customTimeline = [
      {
        stationId: 52,
        commentId: 0,
        positionId: 0,
        startTimeISO: '2022-03-31T06:00:00.000Z',
        endTimeISO: '2022-03-31T08:34:00.000Z',
        notes: '',
      },
      {
        stationId: 52,
        commentId: 27,
        positionId: 23,
        startTimeISO: '2022-03-31T08:34:00.000Z',
        endTimeISO: '2022-03-31T08:46:00.000Z',
        notes: 'some extra note',
      },
    ];
    const wrapper = createWrapper({
      options: { props: { ...propsDefault } },
      performanceLossTimeline: customTimeline,
    });

    const slice = { parent: { sliceStartTmISO: '2022-03-31T08:34:00.000Z' } };
    const actualResult = wrapper.vm.getCurrentTimelineElem(slice);
    expect(actualResult).toStrictEqual(customTimeline[1]);
  });

  test('that getCurrentTimelineElem returns empty object when slice start time is not in any timeline range', () => {
    const customTimeline = [
      {
        stationId: 52,
        commentId: 0,
        positionId: 0,
        startTimeISO: '2022-03-31T06:00:00.000Z',
        endTimeISO: '2022-03-31T08:34:00.000Z',
        notes: '',
      },
      {
        stationId: 52,
        commentId: 27,
        positionId: 23,
        startTimeISO: '2022-03-31T08:34:00.000Z',
        endTimeISO: '2022-03-31T08:46:00.000Z',
        notes: 'some extra note',
      },
    ];
    const wrapper = createWrapper({
      options: { props: { ...propsDefault } },
      performanceLossTimeline: customTimeline,
    });

    const slice = { parent: { sliceStartTmISO: '2022-03-31T08:47:00.000Z' } };
    const actualResult = wrapper.vm.getCurrentTimelineElem(slice);
    expect(actualResult).toStrictEqual({});
  });
});
