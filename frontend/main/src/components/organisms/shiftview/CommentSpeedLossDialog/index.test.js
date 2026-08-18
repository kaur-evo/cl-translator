import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CommentSpeedLossDialog from './index.vue';

import {
  useShiftviewSelectionStore,
  usePerfCommentStore,
  useStationStore,
  usePositionStore,
  useProfileStore,
  useDeviceStore,
  useShiftviewTimelineStore,
} from '@/stores/index';
import statisticsApi from '@/api/statisticsApi';
import performanceCommentApi from '@/api/performanceCommentApi';

vi.mock('@/api/statisticsApi');
statisticsApi.getTopSpeedlossReasons = vi.fn().mockResolvedValue([]);
const savePerformanceCommentMock = vi.fn();
savePerformanceCommentMock.mockReturnValue({ success: true });
vi.mock('@/api/performanceCommentApi');
performanceCommentApi.savePerformanceComment = savePerformanceCommentMock;

const fetchPerfCommentGroups = vi.fn();
const fetchAllPerfComments = vi.fn();

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.bracketRange = storeOverrides.bracketRange ?? { selectedRange: ['2021-01-01T00:00:00.000Z', '2021-01-01T00:10:00.000Z'] };
  selectionStore.sliceSelection = storeOverrides.sliceSelection ?? [{ groupId: 1, sliceStartTmISO: '2021-01-01T00:00:00.000Z', sliceEndTmISO: '2021-01-01T15:00:00.000Z' }];

  const perfCommentStore = usePerfCommentStore(pinia);
  perfCommentStore.perfCommentsMap = storeOverrides.perfCommentsMap ?? { 1: { id: 1, name: 'test1', groupId: 1 }, 3: { id: 3, name: 'test2', groupId: 2 } };
  perfCommentStore.shiftviewStationPerfComments = storeOverrides.shiftviewStationPerfComments ?? [{ id: 1, name: 'test1', groupId: 1 }, { id: 3, name: 'test2', groupId: 2 }];
  perfCommentStore.shiftviewStationPerfCommentGroups = storeOverrides.shiftviewStationPerfCommentGroups ?? [{ id: 1, name: 'testGroup1', local: false }, { id: 2, name: 'testGroup2', local: false }];
  perfCommentStore.perfCommentGroupsMap = storeOverrides.perfCommentGroupsMap ?? ([1, { id: 1, name: 'testGroup1', local: false }], [2, { id: 2, name: 'testGroup2', local: false }]);
  perfCommentStore.fetchPerfCommentGroups = fetchPerfCommentGroups;
  perfCommentStore.fetchAllPerfComments = fetchAllPerfComments;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 1 };

  const positionStore = usePositionStore(pinia);
  positionStore.shiftviewStationPositions = storeOverrides.shiftviewStationPositions ?? [{
    id: 1, name: 'position 1', stationIds: [1], performanceCommentIds: [], commentsEnabled: true, performanceCommentsEnabled: true,
  }];

  const profileStore = useProfileStore(pinia);
  profileStore.language = storeOverrides.language ?? 'et';

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.performanceLossTimeline = storeOverrides.performanceLossTimeline ?? [{ startTimeISO: '2021-01-01T00:00:00.000Z', endTimeISO: '2021-01-02T00:00:00.000Z' }];

  const stores = {
    selectionStore,
    perfCommentStore,
    stationStore,
    positionStore,
    profileStore,
    deviceStore,
    timelineStore,
  };

  const wrapper = shallowMount(CommentSpeedLossDialog, {
    global: { plugins: [pinia] },
    mocks: { setTop5Reasons: vi.fn() },
  });

  return { wrapper, stores, pinia };
};

describe('CommentSpeedLossDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { wrapper } = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('toolbarColor', () => {
    it('returns lw-commented-yellow if formData.commentId is set', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.commentId = 1;
      expect(wrapper.vm.toolbarColor).toBe('lw-commented-yellow');
    });

    it('returns lw-yellow if formData.commentId is not set', () => {
      const { wrapper } = createWrapper();
      wrapper.vm.formData.commentId = null;
      expect(wrapper.vm.toolbarColor).toBe('lw-yellow');
    });
  });

  describe('isExtraNoteRequired', () => {
    it('returns false if selectedReason is not set', () => {
      const { wrapper } = createWrapper();
      // Override selectedReason via computed
      const wrapperWithComputed = shallowMount(CommentSpeedLossDialog, {
        global: { plugins: [wrapper.vm.$pinia] },
        computed: {
          ...CommentSpeedLossDialog.computed,
          selectedReason: () => ({}),
        },
      });

      expect(wrapperWithComputed.vm.isExtraNoteRequired).toBe(false);
    });

    it('returns true if selectedReason.noteRequired is true', () => {
      const { wrapper } = createWrapper();
      const wrapperWithComputed = shallowMount(CommentSpeedLossDialog, {
        global: { plugins: [wrapper.vm.$pinia] },
        computed: {
          ...CommentSpeedLossDialog.computed,
          selectedReason: () => ({ id: 1, name: 'test reason', noteRequired: true }),
        },
      });

      expect(wrapperWithComputed.vm.isExtraNoteRequired).toBe(true);
    });

    it('returns false if selectedReason.noteRequired is false', () => {
      const { wrapper } = createWrapper();
      const wrapperWithComputed = shallowMount(CommentSpeedLossDialog, {
        global: { plugins: [wrapper.vm.$pinia] },
        computed: {
          ...CommentSpeedLossDialog.computed,
          selectedReason: () => ({ id: 1, name: 'test reason', noteRequired: false }),
        },
      });
      expect(wrapperWithComputed.vm.isExtraNoteRequired).toBe(false);
    });
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if formData.commentId is not set', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.commentId = null;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if some commentId from slice selection is not equal to formData.commentId', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            { startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T13:00:00.000Z', commentId: 3 },
            { startTimeISO: '2020-02-02T13:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 4 },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3, sliceStartTmISO: '2020-02-02T12:50:00.000Z', yellowEnd: '2020-02-02T13:00:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 4, sliceStartTmISO: '2020-02-02T13:10:00.000Z', yellowEnd: '2020-02-02T13:50:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
          ],
        },
      });

      wrapper.vm.formData.commentId = 4;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if some positionId from slice selection is not equal to formData.positionId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            {
              startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3, positionId: 1,
            },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3, perfLossPositionId: 1, sliceStartTmISO: '2020-02-02T12:50:00.000Z', yellowEnd: '2020-02-02T13:00:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 3, perfLossPositionId: 1, sliceStartTmISO: '2020-02-02T13:10:00.000Z', yellowEnd: '2020-02-02T13:50:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.positionId = 2;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if some note from slice selection is not equal to formData.notes', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            {
              startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3, notes: 'test note',
            },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3, perfLossNotes: 'test note', sliceStartTmISO: '2020-02-02T12:50:00.000Z', yellowEnd: '2020-02-02T13:00:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 3, perfLossNotes: 'test note', sliceStartTmISO: '2020-02-02T13:10:00.000Z', yellowEnd: '2020-02-02T13:50:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.notes = 'different note';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if selected slices have same comment, position and notes as formData values, but the selectedPerfLossTimelineSliceStartTimes length is 2', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            {
              startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T13:00:00.000Z', commentId: 3, positionId: 1, notes: 'test note',
            },
            {
              startTimeISO: '2020-02-02T13:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3, positionId: 1, notes: 'test note',
            },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3,
              perfLossPositionId: 1,
              perfLossNotes: 'test note',
              sliceStartTmISO: '2020-02-02T12:50:00.000Z',
              yellowEnd: '2020-02-02T13:00:00.000Z',
              perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 3,
              perfLossPositionId: 1,
              perfLossNotes: 'test note',
              sliceStartTmISO: '2020-02-02T13:10:00.000Z',
              yellowEnd: '2020-02-02T13:50:00.000Z',
              perfLossTimelineStart: '2020-02-02T13:00:00.000Z',
            },
          ],
        },
      });

      wrapper.vm.formData.commentId = 3;
      wrapper.vm.formData.positionId = 1;
      wrapper.vm.formData.notes = 'test note';
      expect(wrapper.vm.selectedPerfLossTimelineSliceStartTimes.size).toBe(2);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if selected slices have same comment, position and notes as formData values and the selectedPerfLossTimelineSliceStartTimes length is 1', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            {
              startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3, positionId: 1, notes: 'test note',
            },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3,
              perfLossPositionId: 1,
              perfLossNotes: 'test note',
              sliceStartTmISO: '2020-02-02T12:50:00.000Z',
              yellowEnd: '2020-02-02T13:00:00.000Z',
              perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 3,
              perfLossPositionId: 1,
              perfLossNotes: 'test note',
              sliceStartTmISO: '2020-02-02T13:10:00.000Z',
              yellowEnd: '2020-02-02T13:50:00.000Z',
              perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
          ],
        },
      });

      await flushPromises();

      wrapper.vm.formData.commentId = 3;
      wrapper.vm.formData.positionId = 1;
      wrapper.vm.formData.notes = 'test note';
      expect(wrapper.vm.selectedPerfLossTimelineSliceStartTimes.size).toBe(1);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });
  });

  describe('selectedReason', () => {
    it('returns the selected reason from reasons map if commentId is set', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          perfCommentsMap: {
            3: { id: 3, name: 'test reason' },
          },
        },
      });

      wrapper.vm.formData.commentId = 3;
      expect(wrapper.vm.selectedReason).toEqual({ id: 3, name: 'test reason' });
    });

    it('returns empty object if comment does not exist in perfCommentsMap', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          perfCommentsMap: {
            3: { id: 3, name: 'test reason' },
          },
        },
      });

      wrapper.vm.formData.commentId = 999;
      expect(wrapper.vm.selectedReason).toEqual({});
    });
  });

  describe('enabledPositions', () => {
    it('returns all shiftviewStationPositions with performanceCommentsEnabled', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewStationPositions: [
            { id: 1, name: 'test1', performanceCommentsEnabled: true, performanceCommentIds: [1, 2] },
            { id: 2, name: 'test2', performanceCommentsEnabled: true, performanceCommentIds: [] },
            { id: 3, name: 'test3', performanceCommentsEnabled: false, performanceCommentIds: [] },
          ],
        },
      });

      expect(wrapper.vm.enabledPositions.map((reason) => reason.id)).toEqual([1, 2]);
    });
  });

  describe('mounted', () => {
    test('that fetchPerfCommentGroups and fetchAllPerfComments are called on mounted', async () => {
      createWrapper({
        storeOverrides: { language: 'en' },
      });

      await flushPromises();

      expect(fetchPerfCommentGroups).toHaveBeenCalledWith({ lang: 'en' });
      expect(fetchAllPerfComments).toHaveBeenCalledWith({ lang: 'en' });
    });

    it('has reason preselected if slices in only one commented area are selected', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            { startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3 },
            { startTimeISO: '2020-02-02T14:00:00.000Z', endTimeISO: '2020-02-02T16:00:00.000Z', commentId: 0 },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3, sliceStartTmISO: '2020-02-02T12:00:00.000Z', yellowEnd: '2020-02-02T13:00:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 3, sliceStartTmISO: '2020-02-02T13:10:00.000Z', yellowEnd: '2020-02-02T13:50:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
          ],
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.commentId).toBe(3);
    });

    it('doesnt have anything preselected if slices in the range of multiple performanceLossTimeline slices are selected', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          performanceLossTimeline: [
            { startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T14:00:00.000Z', commentId: 3 },
            { startTimeISO: '2020-02-02T14:00:00.000Z', endTimeISO: '2020-02-02T16:00:00.000Z', commentId: 1 },
          ],
          sliceSelection: [
            {
              perfLossCommentId: 3, sliceStartTmISO: '2020-02-02T12:50:00.000Z', yellowEnd: '2020-02-02T13:00:00.000Z', perfLossTimelineStart: '2020-02-02T12:00:00.000Z',
            },
            {
              perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T14:10:00.000Z', yellowEnd: '2020-02-02T15:50:00.000Z', perfLossTimelineStart: '2020-02-02T14:00:00.000Z',
            },
          ],
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.commentId).toBe(0);
    });
  });

  describe('onSave', () => {
    it('calls savePerformanceComment with correct parameters', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          lineviewStation: { id: 1, zoneId: 'UTC' },
          bracketRange: { selectedRange: ['2021-01-01T00:00:00.000Z', '2021-01-01T15:00:00.000Z'] },
        },
      });

      await flushPromises();
      wrapper.vm.formData.commentId = 2;
      wrapper.vm.formData.positionId = 1;
      wrapper.vm.formData.notes = 'test note';

      wrapper.vm.onSave();

      expect(savePerformanceCommentMock).toHaveBeenCalledWith(1, [{
        commentId: 2,
        positionId: 1,
        notes: 'test note',
        startTimeISO: '2021-01-01T00:00:00.000Z',
        endTimeISO: '2021-01-01T15:00:00.000Z',
      }]);
    });
  });

  describe('setTop5Reasons', () => {
    it('doesnt set top 5 reasons if station has less than 10 comments ', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewStationPerfComments: new Array(9).fill(null).map((_, index) => ({
            id: index + 1,
            name: `reason ${index + 1}`,
            stationIds: [1],
          })),
        },
      });
      await wrapper.vm.setTop5Reasons();

      expect(wrapper.vm.topReasons).toEqual([]);
    });

    it('sets top 5 reasons correctly if station has 10 or more comments', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewStationPerfComments: new Array(15).fill(null).map((_, index) => ({
            id: index + 1,
            name: `reason ${index + 1}`,
            stationIds: [1],
          })),
        },
      });
      await flushPromises();
      const response = [
        { entityId: 1, name: 'reason 1', stationIds: [1] },
        { entityId: 2, name: 'reason 2', stationIds: [1] },
      ];
      statisticsApi.getTopSpeedlossReasons = vi.fn().mockReturnValueOnce(response);
      await wrapper.vm.setTop5Reasons();

      expect(statisticsApi.getTopSpeedlossReasons).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.topReasons).toEqual(response);
    });
  });

  describe('setFormData', () => {
    it('does not set formData if slice is null', () => {
      const { wrapper } = createWrapper();
      wrapper.vm.setFormData(null);
      expect(wrapper.vm.formData).toEqual({
        commentId: 0,
        positionId: 0,
        notes: '',
      });
    });
    it('sets formData correctly based on the provided slice', () => {
      const { wrapper } = createWrapper();
      const slice = {
        commentId: 5,
        positionId: 10,
        notes: 'Test note',
      };
      wrapper.vm.setFormData(slice);
      expect(wrapper.vm.formData).toEqual({
        commentId: 5,
        positionId: 10,
        notes: 'Test note',
      });
    });
  });

  test('that onDelete calls performanceCommentApi.deleteTimelinePerformanceComment with correct parameters', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        lineviewStation: { id: 1, zoneId: 'UTC' },
        sliceSelection: [{ perfLossCommentId: 1, perfLossTimelineStart: '2021-01-01T00:00:00.000Z' }],
        performanceLossTimeline: [{ startTimeISO: '2021-01-01T00:00:00.000Z', endTimeISO: '2021-01-01T15:00:00.000Z', commentId: 1 }],
      },
    });

    await flushPromises();

    await wrapper.vm.onDelete();

    expect(performanceCommentApi.deleteTimelinePerformanceComment).toHaveBeenCalledWith(1, '20210101000000+0000');
  });
});
