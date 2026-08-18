import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SpeedLossOverviewDialog from './index.vue';

import {
  useProfileStore, useShiftviewTimelineStore,
  usePerfCommentStore, usePositionStore, useDeviceStore,
} from '@/stores/index';

const defaultYellowRanges = [
  {
    perfLossCommentId: 1,
    yellowSlices: [
      {
        yellowDuration: 10,
        sliceStartTmISO: '2021-01-01T00:00:00Z',
        yellowEnd: '2021-01-01T00:00:10Z',
        perfLossPositionId: 0,
        perfLossNotes: 'short note',
      },
      {
        yellowDuration: 90,
        sliceStartTmISO: '2021-01-01T01:02:00Z',
        yellowEnd: '2021-01-01T01:03:30Z',
        perfLossPositionId: 0,
        perfLossNotes: 'short note',
      },
    ],
  },
  {
    perfLossCommentId: 0,
    yellowSlices: [
      {
        yellowDuration: 10,
        sliceStartTmISO: '2021-01-01T02:00:00Z',
        yellowEnd: '2021-01-01T03:00:00Z',
        perfLossPositionId: 0,
        perfLossNotes: '',
      },
    ],
  },
  {
    perfLossCommentId: 2,
    yellowSlices: [
      {
        yellowDuration: 10,
        sliceStartTmISO: '2021-01-01T03:00:00Z',
        yellowEnd: '2021-01-01T03:00:10Z',
        perfLossPositionId: 2,
        perfLossNotes: '',
      },
      {
        yellowDuration: 90,
        sliceStartTmISO: '2021-01-01T03:02:00Z',
        yellowEnd: '2021-01-01T03:03:30Z',
        perfLossPositionId: 2,
        perfLossNotes: '',
      },
    ],
  },
];

const defaultPiniaState = {
  station: { lineviewStation: { zoneId: 'UTC' } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const profileStore = useProfileStore(pinia);
  profileStore.isReadOnly = overrides.profile?.isReadOnly ?? false;

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.yellowRanges = overrides.shiftviewTimeline?.yellowRanges ?? defaultYellowRanges;

  const perfCommentStore = usePerfCommentStore(pinia);
  perfCommentStore.perfCommentsRealMap = overrides.perfComment?.perfCommentsRealMap ?? new Map([[1, { id: 1, name: 'comment 1', groupId: 1 }], [2, { id: 2, name: 'comment 2', groupId: 1 }]]);
  perfCommentStore.perfCommentGroupsRealMap = overrides.perfComment?.perfCommentGroupsRealMap ?? new Map([[1, { id: 1, name: 'group 1' }]]);

  const positionStore = usePositionStore(pinia);
  positionStore.positionsRealMap = overrides.position?.positionsRealMap ?? new Map([[1, { positionId: 1, name: 'position 1' }], [1, { positionId: 2, name: 'position 2' }]]);

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(SpeedLossOverviewDialog, {
  global: { plugins: [createPinia(overrides)] },
});

describe('SpeedLossOverviewDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly - tab 0', async () => {
    const wrapper = createWrapper();

    await wrapper.setData({ tab: 0 });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - tab 1', async () => {
    const wrapper = createWrapper();

    await wrapper.setData({ tab: 1 });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - read only', () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - mobile', () => {
    const wrapper = createWrapper({ device: { isMobileView: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
