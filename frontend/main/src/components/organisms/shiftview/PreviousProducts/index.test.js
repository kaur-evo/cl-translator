import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import PreviousProducts from './index.vue';

import {
  useDeviceStore,
  useShiftviewTimelineStore,
  useShiftStore,
} from '@/stores/index';

vi.mock('@/helpers/time/formatTime', () => ({
  formatTime: vi.fn((datetime) => `time: ${datetime.split('T')[1].replace('.000Z', '')}`),
}));

vi.mock('@/helpers/date/formatDate', () => ({
  formatDate: vi.fn((datetime) => `date: ${datetime.split('T')[0]}`),
}));

// currentBatch getter returns first value in Map. Keep it as id=3, prepend to visible batches.
const batchCurrent = { id: 3, productName: 'Product C', productionOrder: 'ORD-003', startTime: '2025-01-01T10:00:00.000Z', endTime: null, notes: null };
const batch1 = { id: 1, productName: 'Product A', productionOrder: 'ORD-001', startTime: '2025-01-01T06:00:00.000Z', endTime: '2025-01-01T08:00:00.000Z', notes: 'Note A' };
const batch2 = { id: 2, productName: 'Product B', productionOrder: null, startTime: '2025-01-01T08:00:00.000Z', endTime: '2025-01-01T10:00:00.000Z', notes: '' };

const defaultBatches = () => new Map([
  [3, batchCurrent],
  [1, batch1],
  [2, batch2],
]);

const defaultProps = {
  valueClass: 'value-class',
};

// Sentinel current batch — inserted first so `currentBatch` getter returns it,
// keeping the caller's `batches` list entirely within `visibleBatches`.
const sentinelCurrent = { id: 999, productName: 'Sentinel' };

const createWrapper = ({
  props = defaultProps,
  batches = defaultBatches(),
  // If `batches` is set without a sentinel, visibleBatches = all entries except the first.
  isMobileView = false,
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.batches = batches;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { startTime: '2025-01-01T06:00:00.000Z' };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  return shallowMount(PreviousProducts, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('PreviousProducts', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ isMobileView: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that getBatchStartTime returns formatted batch start time', () => {
    const wrapper = createWrapper();

    const result = wrapper.vm.getBatchStartTime({ startTime: '2025-01-01T06:00:00.000Z' });

    expect(result).toBe('time: 06:00:00 - date: 2025-01-01');
  });

  describe('mobileBatchItems', () => {
    it('includes Order and Extra note rows when productionOrder and notes exist', () => {
      const wrapper = createWrapper({
        props: {},
        batches: new Map([
          [999, sentinelCurrent],
          [21, { id: 21, productName: 'P21', productionOrder: 'ORD-021', startTime: '2025-01-01T06:00:00.000Z', endTime: '2025-01-01T07:00:00.000Z', notes: 'Note 21' }],
        ]),
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Order', value: 'ORD-021' },
        { label: 'Product', value: 'P21' },
        { label: 'quantity', slot: { batch: wrapper.vm.visibleBatches[0], showGoodQty: true } },
        { label: 'Start time', value: 'time: 06:00:00 - date: 2025-01-01' },
        { label: 'Extra note', value: 'Note 21' },
      ]);
    });

    it('excludes Order row when productionOrder is null', () => {
      const wrapper = createWrapper({
        props: {},
        batches: new Map([
          [999, sentinelCurrent],
          [22, { id: 22, productName: 'P22', productionOrder: null, startTime: '2025-01-01T06:00:00.000Z', endTime: '2025-01-01T07:00:00.000Z', notes: 'Note 22' }],
        ]),
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Product', value: 'P22' },
        { label: 'quantity', slot: { batch: wrapper.vm.visibleBatches[0], showGoodQty: true } },
        { label: 'Start time', value: 'time: 06:00:00 - date: 2025-01-01' },
        { label: 'Extra note', value: 'Note 22' },
      ]);
    });

    it('excludes Extra note row when notes is empty', () => {
      const wrapper = createWrapper({
        props: {},
        batches: new Map([
          [999, sentinelCurrent],
          [23, { id: 23, productName: 'P23', productionOrder: 'ORD-023', startTime: '2025-01-01T06:00:00.000Z', endTime: '2025-01-01T07:00:00.000Z', notes: '' }],
        ]),
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Order', value: 'ORD-023' },
        { label: 'Product', value: 'P23' },
        { label: 'quantity', slot: { batch: wrapper.vm.visibleBatches[0], showGoodQty: true } },
        { label: 'Start time', value: 'time: 06:00:00 - date: 2025-01-01' },
      ]);
    });
  });
});
