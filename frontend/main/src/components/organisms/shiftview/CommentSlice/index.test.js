import { shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { createTestingPinia } from '@pinia/testing';

import CommentSlice from '@/components/organisms/shiftview/CommentSlice/index.vue';
import {
  useShiftviewSelectionStore,
  useCommentStore,
  usePositionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useDeviceStore,
} from '@/stores/index';

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.clickSelectedSlices = {};
  shiftviewSelectionStore.shiftviewSelectionType = null;

  const commentStore = useCommentStore(pinia);
  commentStore.commentsList = [{ id: 1, groupId: 1, name: 'comment 1' }];
  commentStore.commentGroupsList = [{ id: 1, name: 'group 1' }];

  const positionStore = usePositionStore(pinia);
  positionStore.positions = [{ id: 1, name: 'position 1' }];

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.batches = new Map([[1, {
    id: 1, unitId: 'unit', alternativeUnitId: 'alt unit', mainToAltUnitConversion: 1, productName: 'product 1', productSku: '22',
  }]]);
  shiftviewTimelineStore.currentBatch = null;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = 0;

  return shallowMount(CommentSlice, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  commentSegment: {
    name: 'comment 1',
    parent: {
      id: 1,
      commentId: 1,
      batchId: 1,
      sliceStartTmISO: '2023-03-10T12:08:00.000Z',
      duration: 180,
      positionId: 1,
      includeInOee: true,
      idealQty: 3,
      notes: 'stoppage extra note',
    },
  },
  isHovered: true,
  hourLineHeight: 0,
};

describe('CommentSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if comment segment has join id', () => {
    const props = cloneDeep(propsDefault);
    props.commentSegment.parent.joinId = '123-asd';
    const wrapper = createWrapper({
      props,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('tooltipRows', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.tooltipRows).toEqual([
      { key: 'Group', value: 'group 1' },
      { key: 'Start', value: '12:08 (3m)' },
      { key: 'Product', value: 'product 1 (22)' },
      { key: 'Machine location', value: 'position 1' },
      { key: 'Loss', value: '3 alt unit', valueClass: 'text-secondary' },
      { key: 'Extra note', value: 'stoppage extra note', allowTextWrap: true },
    ]);
  });

  test('tooltipRows for long comment', () => {
    const longCommentProps = cloneDeep(propsDefault);
    longCommentProps.commentSegment.parent.duration = 20040;
    const wrapper = createWrapper({
      props: { ...longCommentProps },
    });

    expect(wrapper.vm.tooltipRows).toEqual([
      { key: 'Group', value: 'group 1' },
      { key: 'Start', value: '12:08 (5h 34m)' },
      { key: 'Product', value: 'product 1 (22)' },
      { key: 'Machine location', value: 'position 1' },
      { key: 'Loss', value: '3 alt unit', valueClass: 'text-secondary' },
      { key: 'Extra note', value: 'stoppage extra note', allowTextWrap: true },
    ]);
  });
});
