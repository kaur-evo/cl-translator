import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiMessageReply } from '@mdi/js';

import DowntimeOverviewDialog from './index.vue';

import { useProfileStore, useDeviceStore, useShiftviewTimelineStore, useCommentStore, usePositionStore } from '@/stores/index';

const defaultSlicesByType = {
  uncommented: [],
  commented: [{
    sliceStartTmISO: '2020-02-02T12:00:00.000Z',
    sliceEndTmISO: '2020-02-02T12:02:00.000Z',
    duration: 120,
    commentId: 1,
    positionId: 1,
    notes: 'commented note',
    type: 'STOPPAGE',
  }],
  planned: [{
    sliceStartTmISO: '2020-02-02T12:02:00.000Z',
    sliceEndTmISO: '2020-02-02T12:04:00.000Z',
    duration: 120,
    commentId: 2,
    positionId: 2,
    joinId: '123-asd',
    includeInOee: true,
    notes: 'planned note',
    type: 'STANDBY',
  },
  {
    sliceStartTmISO: '2020-02-02T12:06:00.000Z',
    sliceEndTmISO: '2020-02-02T12:09:00.000Z',
    duration: 180,
    commentId: 2,
    positionId: 2,
    joinId: '123-asd',
    includeInOee: true,
    notes: 'planned note',
    type: 'STANDBY',
  }],
};

const defaultPiniaState = {
  station: { lineviewStation: {} },
  shift: { shift: {} },
  genericDialog: { dialogData: {}, allowFullscreen: true },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const profileStore = useProfileStore(pinia);
  profileStore.isReadOnly = overrides.profile?.isReadOnly ?? false;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.screenWidth = overrides.device?.screenWidth ?? 1600;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.slicesByType = overrides.shiftviewTimeline?.slicesByType ?? defaultSlicesByType;

  const commentStore = useCommentStore(pinia);
  commentStore.commentsRealMap = overrides.comment?.commentsRealMap ?? new Map([[1, { id: 1, name: 'test 1', groupId: 1 }], [2, { id: 2, name: 'test 2', groupId: 1 }]]);
  commentStore.commentGroupsRealMap = overrides.comment?.commentGroupsRealMap ?? new Map([[1, { id: 1, name: 'testGroup1', local: false }]]);

  const positionStore = usePositionStore(pinia);
  positionStore.positionsRealMap = overrides.position?.positionsRealMap ?? new Map([[1, { id: 1, name: 'test position' }], [2, { id: 2, name: 'test position 2' }]]);

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(DowntimeOverviewDialog, {
  global: { plugins: [createPinia(overrides)] },
});

describe('DowntimeOverviewDialog', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in second tab', async () => {
    const wrapper = createWrapper();

    await wrapper.setData({ tab: 1 });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ device: { isMobileView: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that downtime slices are grouped correctly, when tab key is commented', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.tabs[wrapper.vm.tab].key).toBe('commented');
    expect(wrapper.vm.groupedDowntimeSlices.length).toBe(1);
    expect(wrapper.vm.groupedDowntimeSlices[0]).toEqual({
      includeInOeeString: '',
      durationString: '2m',
      locationName: 'test position',
      notes: 'commented note',
      slices: [{
        commentId: 1,
        duration: 120,
        positionId: 1,
        sliceEndTmISO: '2020-02-02T12:02:00.000Z',
        sliceStartTmISO: '2020-02-02T12:00:00.000Z',
        notes: 'commented note',
        type: 'STOPPAGE',
      }],
      stopGroupName: 'testGroup1',
      stopName: 'test 1',
    });
  });

  test('that downtime slices are grouped correctly, when tab key is planned', async () => {
    const wrapper = createWrapper();

    await wrapper.setData({ tab: 2 });

    expect(wrapper.vm.tabs[wrapper.vm.tab].key).toBe('planned');
    expect(wrapper.vm.groupedDowntimeSlices.length).toBe(1);
    expect(wrapper.vm.groupedDowntimeSlices[0]).toEqual({
      includeInOeeString: 'Included',
      durationString: '5m',
      locationsCount: 2,
      notesCount: 2,
      slices: [{
        commentId: 2,
        duration: 120,
        positionId: 2,
        sliceEndTmISO: '2020-02-02T12:04:00.000Z',
        sliceStartTmISO: '2020-02-02T12:02:00.000Z',
        joinId: '123-asd',
        includeInOee: true,
        notes: 'planned note',
        type: 'STANDBY',
      }, {
        commentId: 2,
        duration: 180,
        positionId: 2,
        sliceEndTmISO: '2020-02-02T12:09:00.000Z',
        sliceStartTmISO: '2020-02-02T12:06:00.000Z',
        joinId: '123-asd',
        includeInOee: true,
        notes: 'planned note',
        type: 'STANDBY',
      }],
      stopGroupName: 'testGroup1',
      stopName: 'test 2',
    });
  });

  it('preselects a tab that is provided in dialogData if present', () => {
    const wrapper = createWrapper({ genericDialog: { dialogData: { tab: 2 }, allowFullscreen: true } });

    expect(wrapper.vm.tab).toEqual(2);
  });

  test('that getBorderColor returns correct color, if slice doesnt have comment id', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getBorderColor({ commentId: 0 })).toEqual('lw-red');
  });

  test('that getBorderColor returns correct color, if slice type is STANDBY and included in oee', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getBorderColor({ commentId: 1, type: 'STANDBY', includeInOee: true })).toEqual('secondary-dark');
  });

  test('that getBorderColor returns correct color, if slice type is STANDBY and not included in oee', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getBorderColor({ commentId: 1, type: 'STANDBY', includeInOee: false })).toEqual('lw-gray');
  });

  test('that getBorderColor returns correct color, if slice type is STOPPAGE', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getBorderColor({ commentId: 1, type: 'STOPPAGE' })).toEqual('lw-dark-red');
  });

  test('that getTitleText returns correct title, if array with multiple comment slices is given', () => {
    const wrapper = createWrapper();

    const slices = [
      { commentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z' },
      { commentId: 2, sliceStartTmISO: '2020-02-02T12:06:00.000Z', sliceEndTmISO: '2020-02-02T12:09:00.000Z' },
    ];
    expect(wrapper.vm.getTitleText({ stopName: 'Stop name', slices })).toEqual('12:00 — 12:09 — Stop name');
  });

  test('that getTitleText returns correct title, if array with one comment slice is given', () => {
    const wrapper = createWrapper();

    const slices = [
      { commentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z' },
    ];
    expect(wrapper.vm.getTitleText({ stopName: 'Stop name', slices })).toEqual('12:00 — Stop name');
  });

  test('that getIncludeInOeeString returns correct text, if slice is included in oee', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getIncludeInOeeString({ commentId: 1, type: 'STANDBY', includeInOee: true })).toEqual('Included');
  });

  test('that getIncludeInOeeString returns correct text, if slice is not included in oee', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getIncludeInOeeString({ commentId: 1, type: 'STANDBY', includeInOee: false })).toEqual('Excluded');
  });

  test('that getSubtitleItemsProps returns correct props, if item has locationName', () => {
    const wrapper = createWrapper();

    const item = {
      stopGroupName: 'Group', locationName: 'Location', durationString: 'Duration', includeInOeeString: 'Include', notesCount: 2,
    };
    expect(wrapper.vm.getSubtitleItemsProps(item)).toEqual([
      { text: 'Group', valueKey: 'stopGroupName' },
      { text: 'Machine location', valueKey: 'locationName' },
      { text: 'Duration', valueKey: 'durationString' },
      { text: 'OEE calculation', valueKey: 'includeInOeeString' },
      { icon: mdiMessageReply, valueKey: 'notesCount' },
    ]);
  });

  test('that getSubtitleItemsProps returns correct props, if item doesnt have locationName', () => {
    const wrapper = createWrapper();

    const item = {
      stopGroupName: 'Group', locationsCount: 3, durationString: 'Duration', includeInOeeString: 'Include', notesCount: 2,
    };
    expect(wrapper.vm.getSubtitleItemsProps(item)).toEqual([
      { text: 'Group', valueKey: 'stopGroupName' },
      { text: 'Machine location', valueKey: 'locationsCount' },
      { text: 'Duration', valueKey: 'durationString' },
      { text: 'OEE calculation', valueKey: 'includeInOeeString' },
      { icon: mdiMessageReply, valueKey: 'notesCount' },
    ]);
  });
});
