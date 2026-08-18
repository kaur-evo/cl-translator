import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { it } from 'vitest';

import CommentDowntimeDialog from './index.vue';

import {
  useShiftviewSelectionStore,
  useCommentStore,
  useStationStore,
  usePositionStore,
  useProfileStore,
  useDeviceStore,
  useShiftStore,
  useGenericNotificationStore,
  useGenericDialogStore,
} from '@/stores/index';
import statisticsApi from '@/api/statisticsApi';
import commentApi from '@/api/commentApi';

vi.mock('@/api/statisticsApi');
statisticsApi.getTopStopReasons = vi.fn().mockReturnValue([]);
const saveCommentMock = vi.fn();
saveCommentMock.mockReturnValue({ success: true });
vi.mock('@/api/commentApi');
commentApi.saveComment = saveCommentMock;

const fetchCommentGroups = vi.fn();
const fetchAllComments = vi.fn();

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.bracketRange = storeOverrides.bracketRange ?? {};
  selectionStore.hasSelectedEndChanged = storeOverrides.hasSelectedEndChanged ?? false;
  selectionStore.firstSelectedSlice = storeOverrides.firstSelectedSlice ?? {
    sliceStartTmISO: '2021-01-01T12:00:00.000Z',
    sliceEndTmISO: '2021-01-01T12:01:00.000Z',
  };
  selectionStore.sliceSelection = storeOverrides.sliceSelection ?? [{
    sliceStartTmISO: '2021-01-01T12:00:00.000Z',
    sliceEndTmISO: '2021-01-01T12:01:00.000Z',
  }];

  const commentStore = useCommentStore(pinia);
  commentStore.commentsMap = storeOverrides.commentsMap ?? { 0: { id: 0, name: 'uncommented', groupId: -1 } };
  commentStore.shiftviewStationComments = storeOverrides.shiftviewStationComments ?? [{ id: 1, name: 'comment1', groupId: 1 }];
  commentStore.shiftviewStationCommentGroups = [{
    id: 1, name: 'testGroup1', local: false, deleted: false,
  }, {
    id: 2, name: 'testGroup2', local: false, deleted: false,
  }];
  commentStore.commentGroupsMap = {
    1: {
      id: 1, name: 'testGroup1', local: false, deleted: false,
    },
    2: {
      id: 2, name: 'testGroup2', local: false, deleted: false,
    },
    3: {
      id: 3, name: 'testGroup3', local: false, deleted: true,
    },
  };
  commentStore.fetchCommentGroups = fetchCommentGroups;
  commentStore.fetchAllComments = fetchAllComments;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 1, zoneId: 'UTC' };

  const positionStore = usePositionStore(pinia);
  positionStore.shiftviewStationPositions = storeOverrides.shiftviewStationPositions ?? [{
    id: 1, name: 'position', stationIds: [1], commentIds: [], commentsEnabled: true, performanceCommentsEnabled: true,
  }];

  const profileStore = useProfileStore(pinia);
  profileStore.language = storeOverrides.language ?? 'et';

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = storeOverrides.shift ?? { id: 1 };

  const notificationStore = useGenericNotificationStore(pinia);

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.dialogData = storeOverrides.dialogData ?? {};

  const stores = {
    selectionStore,
    commentStore,
    stationStore,
    positionStore,
    profileStore,
    deviceStore,
    shiftStore,
    notificationStore,
    genericDialogStore,
  };


  const wrapper = shallowMount(CommentDowntimeDialog, {
    global: { plugins: [pinia] },
  });

  return { wrapper, stores, pinia };
};

describe('CommentDowntimeDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('toolbarTitle', () => {
    it('has correct value if one stoppage is selected', async () => {
      const slice = {
        id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
      };
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason' } },
          sliceSelection: [slice],
          firstSelectedSlice: slice,
        },
      });

      await flushPromises();

      expect(wrapper.vm.toolbarTitle).toBe('third reason 11:30 - 11:45');
    });

    it('has correct value if one cropped stoppage is selected', async () => {
      const slice = {
        id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
      };
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason' } },
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T11:30:00.000Z', '2020-02-02T11:35:00.000Z'] },
        },
      });

      await flushPromises();

      expect(wrapper.vm.toolbarTitle).toBe('third reason 11:30 - 11:35');
    });

    it('has correct value if multiple stoppages with same comment, location and note are selected', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason' } },
          sliceSelection: [
            {
              id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', duration: 15 * 60, positionId: 11, notes: 'testnote',
            },
            {
              id: 5, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', duration: 5 * 60, positionId: 11, notes: 'testnote',
            },
          ],
        },
      });

      await flushPromises();

      expect(wrapper.vm.toolbarTitle).toBe('third reason (2) (20min)');
    });

    it('has correct value if multiple stoppages with same comment, but different location and note are selected', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 0: { id: 0, name: 'uncommented' }, 3: { id: 3, name: 'third reason' } },
          sliceSelection: [
            {
              id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', duration: 15 * 60, positionId: 11, notes: 'testnote',
            },
            {
              id: 5, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', duration: 5 * 60, positionId: 1, notes: 'testnote2',
            },
          ],
        },
      });

      await flushPromises();

      expect(wrapper.vm.toolbarTitle).toBe('uncommented (2) (20min)');
    });
  });

  describe('selectedComment', () => {
    it('returns comment from commentsMap based on formData.commentId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { commentsMap: { 3: { id: 3, name: 'third reason' } } },
      });

      await wrapper.setData({ formData: { commentId: 3 } });
      expect(wrapper.vm.selectedComment).toEqual({ id: 3, name: 'third reason' });
    });
    it('returns uncommented when comment is not found in commentsMap', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { commentsMap: {} },
      });
      await wrapper.setData({ formData: { commentId: 3 } });
      expect(wrapper.vm.selectedComment).toEqual({ name: 'Uncommented' });
    });
  });

  describe('isExtraNoteRequired', () => {
    it('returns true when multiple slices are selected and some slice duration is bigger than selected comment noteRequiredDuration', async () => {
      const firstSlice = {
        id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', duration: 15 * 60,
      };
      const secondSlice = {
        id: 5, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', duration: 5 * 60,
      };
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason', noteRequired: true, noteRequiredDuration: 10 * 60 } },
          sliceSelection: [firstSlice, secondSlice],
        },
      });

      await wrapper.setData({ formData: { commentId: 3 } });
      expect(wrapper.vm.isExtraNoteRequired).toEqual(true);
    });

    it('returns true when cropped slice is selected and this duration is bigger than selected comment noteRequiredDuration', async () => {
      const slice = {
        id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', duration: 15 * 60,
      };
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason', noteRequired: true, noteRequiredDuration: 3 * 60 } },
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T11:30:00.000Z', '2020-02-02T11:35:00.000Z'] },
        },
      });

      await wrapper.setData({ formData: { commentId: 3 } });
      expect(wrapper.vm.isExtraNoteRequired).toEqual(true);
    });

    it('returns true when selected slice duration is bigger than selected comment noteRequiredDuration', async () => {
      const slice = {
        id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', duration: 15 * 60,
      };
      const { wrapper } = createWrapper({
        storeOverrides: {
          commentsMap: { 3: { id: 3, name: 'third reason', noteRequired: true, noteRequiredDuration: 10 * 60 } },
          sliceSelection: [slice],
        },
      });

      await wrapper.setData({ formData: { commentId: 3 } });
      expect(wrapper.vm.isExtraNoteRequired).toEqual(true);
    });
  });

  describe('areAllSelectedStoppagesIdentical', () => {
    it('returns false, if commented selected stoppages length is 0', () => {
      const { wrapper } = createWrapper();
      expect(wrapper.vm.areAllSelectedStoppagesIdentical).toEqual(false);
    });

    it('returns false, if selected commented stoppages have different commentIds', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 11, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
          },
          {
            id: 2, commentId: 12, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z',
          },
        ] },
      });
      expect(wrapper.vm.areAllSelectedStoppagesIdentical).toEqual(false);
    });

    it('returns false, if selected commented stoppages have same commentIds, but different positionIds', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 11, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1,
          },
          {
            id: 2, commentId: 11, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 2,
          },
        ] },
      });
      expect(wrapper.vm.areAllSelectedStoppagesIdentical).toEqual(false);
    });

    it('returns false, if selected commented stoppages have same commentIds, same positionIds, but different notes', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 11, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'note1',
          },
          {
            id: 2, commentId: 11, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'note2',
          },
        ] },
      });
      expect(wrapper.vm.areAllSelectedStoppagesIdentical).toEqual(false);
    });

    it('returns true, if selected commented stoppages have same commentIds, same positionIds and same notes', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 11, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'note1',
          },
          {
            id: 2, commentId: 11, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'note1',
          },
        ] },
      });
      expect(wrapper.vm.areAllSelectedStoppagesIdentical).toEqual(true);
    });
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if formData.commentId is not set', async () => {
      const { wrapper } = createWrapper();

      await flushPromises();
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if saveLoading is true', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.saveLoading = true;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if some commentId from slice selection is not equal to formData.commentId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [{
          id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
        }, {
          id: 2, commentId: 4, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
        }] },
      });

      await flushPromises();
      wrapper.vm.formData.commentId = 4;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if some positionId from slice selection is not equal to formData.positionId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [{
          id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
        }, {
          id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 2, notes: 'test note', joinId: '123-asd',
        }] },
      });

      await flushPromises();
      wrapper.vm.formData.positionId = 2;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if some note from slice selection is not equal to formData.notes', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [{
          id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
        }, {
          id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note 2', joinId: '123-asd',
        }] },
      });

      await flushPromises();
      wrapper.vm.formData.notes = 'new note';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if some joinId from slice selection is not equal to joinId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [{
          id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
        }, {
          id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note', joinId: '456-zxc',
        }] },
      });

      await flushPromises();
      wrapper.vm.joinId = 'fakeJoinId';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if one of the selected slices does not have commentId, but formData.commentId, formData.positionId, formData.notes and joinId are equal to slice selection values', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 0, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
          },
          {
            id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
          },
        ] },
      });

      await flushPromises();
      expect(wrapper.vm.formData.commentId).toBe(3);
      expect(wrapper.vm.formData.positionId).toBe(1);
      expect(wrapper.vm.formData.notes).toBe('test note');
      expect(wrapper.vm.joinId).toBe('123-asd');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if all selected slices have commentIds and formData.commentId, formData.positionId, formData.notes and joinId are equal to slice selection values', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
          },
          {
            id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
          },
        ] },
      });

      await flushPromises();
      expect(wrapper.vm.formData.commentId).toBe(3);
      expect(wrapper.vm.formData.positionId).toBe(1);
      expect(wrapper.vm.formData.notes).toBe('test note');
      expect(wrapper.vm.joinId).toBe('123-asd');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if nothing else has changed, but hasSelectedEndChanged is true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [
            {
              id: 1, commentId: 3, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
            },
            {
              id: 2, commentId: 3, sliceStartTmISO: '2020-02-02T11:55:00.000Z', sliceEndTmISO: '2020-02-02T12:00:00.000Z', positionId: 1, notes: 'test note', joinId: '123-asd',
            },
          ],
          hasSelectedEndChanged: true,
        },
      });

      await flushPromises();
      expect(wrapper.vm.formData.commentId).toBe(3);
      expect(wrapper.vm.formData.positionId).toBe(1);
      expect(wrapper.vm.formData.notes).toBe('test note');
      expect(wrapper.vm.joinId).toBe('123-asd');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });
  });

  describe('enabledPositions', () => {
    it('returns only positions that have comments enabled', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { shiftviewStationPositions: [
          { id: 1, name: 'position 1', commentsEnabled: true, commentIds: [1, 2] },
          { id: 2, name: 'position 2', commentsEnabled: false, commentIds: [] },
          { id: 3, name: 'position 3', commentsEnabled: true, commentIds: [] },
        ] },
      });

      expect(wrapper.vm.enabledPositions).toEqual([
        { id: 1, name: 'position 1', commentsEnabled: true, commentIds: [1, 2] },
        { id: 3, name: 'position 3', commentsEnabled: true, commentIds: [] },
      ]);
    });
  });

  describe('onMounted', () => {
    test('that fetchCommentGroups and fetchAllComments are called on mounted', async () => {
      createWrapper({
        storeOverrides: { language: 'en' },
      });

      await flushPromises();

      expect(fetchCommentGroups).toHaveBeenCalledWith({ lang: 'en' });
      expect(fetchAllComments).toHaveBeenCalledWith({ lang: 'en' });
    });

    it('has comment preselected if only one of selected slices has comment added', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [
            {
              id: 1, commentId: 2, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
            },
            {
              id: 5, commentId: 0, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z',
            },
          ],
          bracketRange: { selectedRange: ['2020-02-02T11:00:00.000Z', '2020-02-02T15:00:00.000Z'] },
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.commentId).toBe(2);
    });

    it('doesnt have comment preselected if more than one of selected slices has comment added', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [
            {
              id: 1, commentId: 2, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
            },
            {
              id: 5, commentId: 1, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z',
            },
          ],
          bracketRange: { selectedRange: ['2020-02-02T11:00:00.000Z', '2020-02-02T15:00:00.000Z'] },
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.commentId).toBe(0);
    });
  });

  describe('getPayloadSlices', () => {
    it('returns the slice when commented slice is selected and no changes are made', async () => {
      const commentedSlice = {
        id: 1,
        commentId: 1,
        sliceStartTmISO: '2020-02-02T11:30:00.000Z',
        sliceEndTmISO: '2020-02-02T11:45:00.000Z',
        positionId: 1,
        notes: 'test note',
        joinId: '123-asd',
      };
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [commentedSlice] },
      });

      await flushPromises();

      expect(wrapper.vm.getPayloadSlices()).toEqual([{
        commentId: 1,
        positionId: 1,
        notes: 'test note',
        startTimeISO: '2020-02-02T11:30:00.000Z',
        endTimeISO: null,
        joinId: '123-asd',
      }]);
    });

    it('adds same commentId, positionId, notes and joinId to both slices and returns these in the array when commented and uncommented slices are selected', async () => {
      const commentedSlice = {
        id: 1,
        commentId: 1,
        sliceStartTmISO: '2020-02-02T11:30:00.000Z',
        sliceEndTmISO: '2020-02-02T11:45:00.000Z',
        positionId: 1,
        notes: 'test note',
        joinId: '123-asd',
      };
      const uncommentedSlice = {
        id: 2,
        commentId: 0,
        sliceStartTmISO: '2020-02-02T11:55:00.000Z',
        sliceEndTmISO: '2020-02-02T12:00:00.000Z',
        positionId: 0,
        notes: '',
      };
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [commentedSlice, uncommentedSlice] },
      });

      await flushPromises();

      expect(wrapper.vm.getPayloadSlices()).toEqual([{
        commentId: 1,
        positionId: 1,
        notes: 'test note',
        startTimeISO: '2020-02-02T11:30:00.000Z',
        endTimeISO: null,
        joinId: '123-asd',
      }, {
        commentId: 1,
        positionId: 1,
        notes: 'test note',
        startTimeISO: '2020-02-02T11:55:00.000Z',
        endTimeISO: null,
        joinId: '123-asd',
      }]);
    });

    it('adds new commentId, positionId and notes from formData to both slices and returns these in result array when 2 commented slices are selected', async () => {
      const commentedSliceInFirstJoin = {
        id: 1,
        commentId: 1,
        sliceStartTmISO: '2020-02-02T11:30:00.000Z',
        sliceEndTmISO: '2020-02-02T11:45:00.000Z',
        positionId: 1,
        notes: 'test note',
        joinId: '123-asd',
      };
      const commentedSliceInSecondJoin = {
        id: 2,
        commentId: 1,
        sliceStartTmISO: '2020-02-02T11:55:00.000Z',
        sliceEndTmISO: '2020-02-02T12:00:00.000Z',
        positionId: 1,
        notes: 'test note',
        joinId: '456-fgh',
      };
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [commentedSliceInFirstJoin, commentedSliceInSecondJoin] },
      });

      await wrapper.setData({ formData: { commentId: 3, positionId: 5, notes: 'test2' } });

      expect(wrapper.vm.getPayloadSlices()).toEqual([{
        commentId: 3,
        positionId: 5,
        notes: 'test2',
        startTimeISO: '2020-02-02T11:30:00.000Z',
        endTimeISO: null,
      }, {
        commentId: 3,
        positionId: 5,
        notes: 'test2',
        startTimeISO: '2020-02-02T11:55:00.000Z',
        endTimeISO: null,
      }]);
    });
  });

  describe('onSave', () => {
    it('sends correct data when saving cropped stoppage', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [{ id: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T16:30:00.000Z' }],
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T15:00:00.000Z'] },
          hasSelectedEndChanged: true,
        },
      });

      await wrapper.setData({
        formData: {
          commentId: 12,
          positionId: 13,
          notes: 'test note',
        },
      });

      wrapper.vm.onSave();
      expect(saveCommentMock).toHaveBeenCalledTimes(1);
      expect(saveCommentMock).toHaveBeenCalledWith(1, 1, [{
        commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T12:00:00.000Z', endTimeISO: '2020-02-02T15:00:00.000Z',
      }], false);
    });

    it('sends correct data when saving single stoppage without cropping', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [{ id: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T16:30:00.000Z' }],
          bracketRange: { selectedRange: ['2020-02-02T11:30:00.000Z', '2020-02-02T16:30:00.000Z'] },
          hasSelectedEndChanged: false,
        },
      });

      await wrapper.setData({
        formData: {
          commentId: 12,
          positionId: 13,
          notes: 'test note',
        },
      });

      wrapper.vm.onSave();
      expect(saveCommentMock).toHaveBeenCalledTimes(1);
      expect(saveCommentMock).toHaveBeenCalledWith(1, 1, [{
        commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T11:30:00.000Z', endTimeISO: null,
      }], false);
    });

    it('send correct data when saving multiple comments with cropping the end', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [
            { id: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z' },
            { id: 5, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z' },
          ],
          bracketRange: { selectedRange: ['2020-02-02T11:40:00.000Z', '2020-02-02T14:45:00.000Z'] },
          hasSelectedEndChanged: true,
        },
      });

      await wrapper.setData({
        formData: {
          commentId: 12,
          positionId: 13,
          notes: 'test note',
        },
      });

      wrapper.vm.onSave();
      expect(saveCommentMock).toHaveBeenCalledTimes(1);
      expect(saveCommentMock).toHaveBeenCalledWith(1, 1, [
        {
          commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T11:40:00.000Z', endTimeISO: null,
        },
        {
          commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T14:30:00.000Z', endTimeISO: '2020-02-02T14:45:00.000Z',
        },
      ], false);
    });

    it('sends correct data when saving multiple comments without cropping the end', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          { id: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z' },
          { id: 5, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z' },
        ] },
      });

      await wrapper.setData({
        formData: {
          commentId: 7,
          positionId: 6,
          notes: 'note 55677',
        },
      });

      wrapper.vm.onSave();
      expect(saveCommentMock).toHaveBeenCalledTimes(1);
      expect(saveCommentMock).toHaveBeenCalledWith(1, 1, [
        {
          commentId: 7, positionId: 6, notes: 'note 55677', startTimeISO: '2020-02-02T11:30:00.000Z', endTimeISO: null,
        },
        {
          commentId: 7, positionId: 6, notes: 'note 55677', startTimeISO: '2020-02-02T14:30:00.000Z', endTimeISO: null,
        },
      ], false);
    });

    it('sends correct data when multiple stoppages are selected with clicking', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          sliceSelection: [
            { id: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z' },
            { id: 5, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z' },
          ],
          bracketRange: { selectedRange: ['2020-02-02T11:30:00.000Z', '2020-02-02T14:55:00.000Z'] },
          hasSelectedEndChanged: false,
        },
      });

      await wrapper.setData({
        formData: {
          commentId: 12,
          positionId: 13,
          notes: 'test note',
        },
      });

      wrapper.vm.onSave();
      expect(saveCommentMock).toHaveBeenCalledTimes(1);
      expect(saveCommentMock).toHaveBeenCalledWith(1, 1, [
        {
          commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T11:30:00.000Z', endTimeISO: null,
        },
        {
          commentId: 12, positionId: 13, notes: 'test note', startTimeISO: '2020-02-02T14:30:00.000Z', endTimeISO: null,
        },
      ], false);
    });
  });

  describe('setTop5Reasons', () => {
    it('does not set topReasons if there are less than 10 reasons', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { shiftviewStationComments: [
          { id: 1, name: 'comment 1', usageCount: 5 },
          { id: 2, name: 'comment 2', usageCount: 3 },
          { id: 3, name: 'comment 3', usageCount: 8 },
          { id: 4, name: 'comment 4', usageCount: 1 },
          { id: 5, name: 'comment 5', usageCount: 0 },
          { id: 6, name: 'comment 6', usageCount: 2 },
          { id: 7, name: 'comment 7', usageCount: 4 },
          { id: 8, name: 'comment 8', usageCount: 6 },
          { id: 9, name: 'comment 9', usageCount: 7 },
        ] },
      });

      await flushPromises();

      expect(wrapper.vm.topReasons).toEqual([]);
    });

    it('sets top 5 reasons if there are 10 or more reasons', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { shiftviewStationComments: [
          { id: 1, name: 'comment 1', usageCount: 5 },
          { id: 2, name: 'comment 2', usageCount: 3 },
          { id: 3, name: 'comment 3', usageCount: 8 },
          { id: 4, name: 'comment 4', usageCount: 1 },
          { id: 5, name: 'comment 5', usageCount: 0 },
          { id: 6, name: 'comment 6', usageCount: 2 },
          { id: 7, name: 'comment 7', usageCount: 4 },
          { id: 8, name: 'comment 8', usageCount: 6 },
          { id: 9, name: 'comment 9', usageCount: 7 },
          { id: 10, name: 'comment 10', usageCount: 9 },
        ] },
      });

      const result = [
        { entityId: 10, name: 'comment 10' },
        { entityId: 3, name: 'comment 3' },
      ];
      statisticsApi.getTopStopReasons = vi.fn().mockResolvedValueOnce(result);

      await flushPromises();
      wrapper.vm.setTop5Reasons();
      expect(statisticsApi.getTopStopReasons).toHaveBeenCalledWith({ stationIds: [1], lang: 'et' });
      expect(wrapper.vm.topReasons).toEqual(result);
    });
  });

  describe('setDialogData', () => {
    test('that when input data doesnt have joinId, then setDialogData sets note and positionId to formData', async () => {
      const { wrapper } = createWrapper();

      await flushPromises();

      wrapper.vm.setDialogData([{
        commentId: 1, notes: 'test note', positionId: 1, joinId: null,
      }]);
      expect(wrapper.vm.formData).toEqual({ commentId: 1, notes: 'test note', positionId: 1 });
    });

    test('that when input data has multiple items, joinId, different positionId, but same notes, then setDialogData sets note to formData', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.setDialogData([{
        commentId: 1, notes: 'test note', positionId: 1, joinId: '123-asd',
      }, {
        commentId: 1, notes: 'test note', positionId: 3, joinId: '123-asd',
      }]);
      expect(wrapper.vm.formData).toEqual({ commentId: 1, notes: 'test note', positionId: 0 });
    });

    test('that when input data has multiple items, joinId, different notes, but same positionId, then setDialogData sets positionId to formData', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.setDialogData([{
        commentId: 1, notes: 'test note', positionId: 1, joinId: '123-asd',
      }, {
        commentId: 1, notes: 'test note2', positionId: 1, joinId: '123-asd',
      }]);
      expect(wrapper.vm.formData).toEqual({ commentId: 1, notes: '', positionId: 1 });
    });

    test('that when input data has multiple items, joinId, different notes and positionId, then setDialogData doesnt set notes and positionId to formData', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.setDialogData([{
        commentId: 1, notes: 'test note', positionId: 1, joinId: '123-asd',
      }, {
        commentId: 1, notes: 'test note2', positionId: 3, joinId: '123-asd',
      }]);
      expect(wrapper.vm.formData).toEqual({ commentId: 1, notes: '', positionId: 0 });
    });

    test('that when input has multiple items, joinId and one item has notes, other item has positionId, then setDialogData sets notes and positionId to formData', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.setDialogData([{
        commentId: 1, notes: 'test note', positionId: 0, joinId: '123-asd',
      }, {
        commentId: 1, notes: '', positionId: 3, joinId: '123-asd',
      }]);
      expect(wrapper.vm.formData).toEqual({ commentId: 1, notes: 'test note', positionId: 3 });
    });
  });

  describe('isJoinChipEnabled', () => {
    it('returns false if sliceSelection length is 1 andselected slice joinId is null', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            commentId: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', joinId: null,
          },
        ] },
      });

      expect(wrapper.vm.isJoinChipEnabled({ id: 1, name: 'comment1', groupId: 1 })).toEqual(false);
    });

    it('returns true if sliceSelection length is 1 and selected slice has joinId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            commentId: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', joinId: 11,
          },
        ] },
      });

      await flushPromises();

      expect(wrapper.vm.isJoinChipEnabled({ id: 1, name: 'comment1', groupId: 1 })).toEqual(true);
    });

    it('returns false if sliceSelection length is 1 and selected slice comment id is different from isJoinChipEnabled input slice id', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            commentId: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z', joinId: 11,
          },
        ] },
      });

      expect(wrapper.vm.isJoinChipEnabled({
        id: 2, name: 'comment1', groupId: 1, joinId: 11,
      })).toEqual(false);
    });

    it('returns true if sliceSelection length is 2 and both slices have joinId', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { sliceSelection: [
          {
            commentId: 1, sliceStartTmISO: '2020-02-02T11:30:00.000Z', sliceEndTmISO: '2020-02-02T11:45:00.000Z',
          },
          {
            commentId: 1, sliceStartTmISO: '2020-02-02T14:30:00.000Z', sliceEndTmISO: '2020-02-02T14:55:00.000Z',
          },
        ] },
      });

      expect(wrapper.vm.isJoinChipEnabled({ id: 1, name: 'comment1', groupId: 1 })).toEqual(true);
    });
  });

  describe('selectComment', () => {
    it('sets commentId to formData', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.selectComment(5);
      expect(wrapper.vm.formData.commentId).toBe(5);
    });

    it('sets joinId to null if resetJoin is true', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.joinId = '123-asd';

      wrapper.vm.selectComment(5, true);
      expect(wrapper.vm.joinId).toBeNull();
    });

    it('leaves joinId unchanged if resetJoin is false', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.joinId = '123-asd';

      wrapper.vm.selectComment(5, false);
      expect(wrapper.vm.joinId).toBe('123-asd');
    });
  });

  test('that onDelete clears formData and joinId and calls onSave', async () => {
    const { wrapper } = createWrapper();

    const onSave = vi.spyOn(wrapper.vm, 'onSave');

    await wrapper.setData({
      formData: {
        commentId: 12,
        positionId: 13,
        notes: 'test note',
      },
      joinId: '123-asd',
    });

    await wrapper.vm.onDelete();
    expect(wrapper.vm.formData).toEqual({ commentId: 0, positionId: 0, notes: '' });
    expect(wrapper.vm.joinId).toBeNull();
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
