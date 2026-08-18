import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CommentDialog from '.';

import {
  useDeviceStore,
  useProfileStore,
  useConfigurationStore,
  useGenericDialogStore,
  useConfirmDialogStore,
  useShiftviewSelectionStore,
  useGenericNotificationStore,
  usePositionStore,
} from '@/stores/index';

vi.mock('@/helpers/localStorage/getItemsFromLocalStorageArray', () => ({
  default: vi.fn(() => []),
}));

const propsDefaults = {
  selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
  toolbarColor: 'primary',
  toolbarTitle: 'Add Comment',
  reasons: [{ id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }, { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true }],
  reasonsMap: { 1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }, 2: { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true } },
  groups: [{ id: 1, name: 'Group 1' }, { id: 2, name: 'Group 2' }],
  groupsMap: { 1: { id: 1, name: 'Group 1' }, 2: { id: 2, name: 'Group 2' } },
  positions: [{ id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [] }, { id: 2, name: 'Position 2', commentsEnabled: false, commentIds: [] }],
  emptyViewHeader: 'No Comments Available',
  emptyViewDescription: 'There are no comments to display at this time.',
  emptyViewImg: 'downtime',
  settingsModule: 'comments',
  loading: false,
  saveDisabled: false,
  saveCallback: vi.fn(),
  topReasons: [{ id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }, { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true }],
  topReasonsLoading: false,
  extraNoteRequired: false,
  noteStorageKey: 'key',
  originalReasonsCount: 12,
  positionEntityProp: 'commentIds',
};

const createWrapper = ({ storeOverrides = {}, props = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;
  deviceStore.screenHeight = storeOverrides.screenHeight ?? 800;
  deviceStore.screenWidth = storeOverrides.screenWidth ?? 1200;
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? false;

  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = storeOverrides.highestRoleAllows ?? (() => true);

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.showLocationBeforeGroup = storeOverrides.showLocationBeforeGroup ?? false;
  configurationStore.showLocationBeforeReason = storeOverrides.showLocationBeforeReason ?? false;

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.previousState = storeOverrides.previousState ?? {};

  const confirmDialogStore = useConfirmDialogStore(pinia);

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.sliceSelection = storeOverrides.sliceSelection ?? [];

  const notificationStore = useGenericNotificationStore(pinia);

  const positionStore = usePositionStore(pinia);
  positionStore.positionsMap = storeOverrides.positionsMap ?? {};

  const stores = {
    deviceStore,
    profileStore,
    configurationStore,
    genericDialogStore,
    confirmDialogStore,
    selectionStore,
    notificationStore,
    positionStore,
  };

  const wrapper = shallowMount(CommentDialog, {
    global: { plugins: [pinia] },
    props: { ...propsDefaults, ...props },
  });

  return { wrapper, stores, pinia };
};

describe('CommentDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with reasons', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without reasons', () => {
    const { wrapper } = createWrapper({
      props: {
        reasons: [],
        reasonsMap: {},
        originalReasonsCount: 0,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const { wrapper } = createWrapper({ props: { loading: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const { wrapper } = createWrapper({ storeOverrides: { isMobileView: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if showLocationBeforeGroup is true', () => {
    const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeGroup: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if showLocationBeforeReason is true', () => {
    const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeReason: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when isEdit is true', () => {
    const { wrapper } = createWrapper({ props: { isEdit: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that filteredGroups does not contain groups that do not have any reasons', () => {
    const { wrapper } = createWrapper({
      props: {
        reasons: [{ id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }],
        reasonsMap: { 1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false } },
        groups: [{ id: 1, name: 'Group 1' }, { id: 2, name: 'Group 2' }],
        groupsMap: { 1: { id: 1, name: 'Group 1' }, 2: { id: 2, name: 'Group 2' } },
      },
    });

    expect(wrapper.vm.filteredGroups).toEqual([{ id: 2, name: 'Group 2' }]);
  });

  describe('filteredReasons', () => {
    it('returns all reasons if position select is shown last and group is not selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: false, showLocationBeforeReason: false },
        props: { reasons },
      });

      expect(wrapper.vm.filteredReasons).toEqual(reasons);
    });

    it('returns only reasons for selected group if position select is shown last and group is selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: false, showLocationBeforeReason: false },
        props: { reasons },
      });
      wrapper.vm.groupId = 2;
      expect(wrapper.vm.filteredReasons).toEqual([reasons[1]]);
    });

    it('returns all reasons if position select is shown before reason select and position is not selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true, showLocationBeforeReason: false },
        props: { reasons },
      });
      expect(wrapper.vm.filteredReasons).toEqual(reasons);
    });

    it('returns reasons filtered by position if position select is shown before reason select and position is selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: {
          showLocationBeforeGroup: true,
          showLocationBeforeReason: false,
          positionsMap: {
            1: { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [] },
            2: { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [2] },
          },
        },
        props: { reasons, positionId: 2 },
      });
      expect(wrapper.vm.filteredReasons).toEqual([reasons[1]]);
    });

    it('returns reasons filtered by position and group if position select is shown before reason select and position and group are selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
        { id: 3, groupId: 2, name: 'Reason 3', requirePosition: false },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: {
          showLocationBeforeGroup: true,
          showLocationBeforeReason: false,
          positionsMap: {
            1: { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [] },
            2: { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [1, 2] },
          },
        },
        props: { reasons, positionId: 2 },
      });
      wrapper.vm.groupId = 2;
      expect(wrapper.vm.filteredReasons).toEqual([{ id: 2, groupId: 2, name: 'Reason 2', requirePosition: true }]);
    });
  });

  describe('selectableTopReasons', () => {
    it('returns all reasons if showLocationBeforeGroup is true and position is selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { reasons, positionId: 1 },
      });
      expect(wrapper.vm.selectableTopReasons).toEqual(reasons);
    });

    it('returns empty array if showLocationBeforeGroup is true and position is not selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { reasons, positionId: null },
      });
      expect(wrapper.vm.selectableTopReasons).toEqual([]);
    });

    it('returns empty array if showLocationBeforeReason is true and group is not selected', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true },
        props: { reasons, groupId: null },
      });
      expect(wrapper.vm.selectableTopReasons).toEqual([]);
    });

    it('returns all reasons if showLocationBeforeGroup is false and showLocationBeforeReason is false', () => {
      const reasons = [
        { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: false, showLocationBeforeReason: false },
        props: { reasons },
      });
      expect(wrapper.vm.selectableTopReasons).toEqual(reasons);
    });
  });

  describe('filteredPositions', () => {
    it('returns all positions if showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeGroup: true } });
      expect(wrapper.vm.filteredPositions).toEqual(propsDefaults.positions);
    });

    it('returns all positions if showLocationBeforeReason is true and group is not selected', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeReason: true } });
      expect(wrapper.vm.filteredPositions).toEqual(propsDefaults.positions);
    });

    it('returns filtered positions if showLocationBeforeReason is true and group is selected', () => {
      const positions = [
        { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [1], groupId: 2 },
        { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [3], groupId: 1 },
        { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [], groupId: 1 },
      ];
      const reasons = [
        { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 1, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true },
        props: { reasons, positions },
      });

      wrapper.vm.groupId = 2;
      expect(wrapper.vm.filteredPositions).toEqual([
        { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [1], groupId: 2 },
        { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [], groupId: 1 },
      ]);
    });

    it('returns filtered positions if position select is show last and reason is selected', () => {
      const positions = [
        { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [] },
        { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [1] },
        { id: 3, name: 'Position 3', commentsEnabled: true, commentIds: [2] },
      ];
      const reasons = [
        { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
        { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
      ];
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: false, showLocationBeforeReason: false },
        props: {
          reasons,
          positions,
          selectedReason: { id: 1 },
        },
      });
      expect(wrapper.vm.filteredPositions).toEqual([
        { id: 1, name: 'Position 1', commentsEnabled: true, commentIds: [] },
        { id: 2, name: 'Position 2', commentsEnabled: true, commentIds: [1] },
      ]);
    });
  });

  describe('searchItems', () => {
    it('returns reasons and positions when selectedReason is set and showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({
        props: { selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false } },
      });
      expect(wrapper.vm.searchItems).toEqual([...propsDefaults.reasons, ...propsDefaults.positions]);
    });

    it('returns only reasons when selectedReason is not set and showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({
        props: { selectedReason: { id: 0 } },
      });
      expect(wrapper.vm.searchItems).toEqual(propsDefaults.reasons);
    });

    it('returns positions and reasons when position is set and showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { positionId: 1 },
      });
      expect(wrapper.vm.searchItems).toEqual([...propsDefaults.positions, ...propsDefaults.reasons]);
    });

    it('returns only positions when position is not set and showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { positionId: 0 },
      });
      expect(wrapper.vm.searchItems).toEqual(propsDefaults.positions);
    });
  });

  describe('isGroupSelectEnabled', () => {
    it('returns true when showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeGroup: false } });
      expect(wrapper.vm.isGroupSelectEnabled).toBe(true);
    });

    it('returns true if showLocationBeforeGroup is true and position is set', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { positionId: 1 },
      });
      expect(wrapper.vm.isGroupSelectEnabled).toBe(true);
    });

    it('returns false if showLocationBeforeGroup is true and position is not set', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: { positionId: 0 },
      });
      expect(wrapper.vm.isGroupSelectEnabled).toBe(false);
    });
  });

  describe('isReasonSelectEnabled', () => {
    it('returns true when showLocationBeforeReason is true and position is set', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true },
        props: { positionId: 1 },
      });
      expect(wrapper.vm.isReasonSelectEnabled).toBe(true);
    });

    it('returns false if showLocationBeforeGroup is true and position is not set', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: {
          positionId: 0,
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
        },
      });
      expect(wrapper.vm.isReasonSelectEnabled).toBe(false);
    });

    it('returns true if showLocationBeforeGroup is false and groupId is set', () => {
      const { wrapper } = createWrapper();
      wrapper.vm.groupId = 2;
      expect(wrapper.vm.isReasonSelectEnabled).toBe(true);
    });

    it('returns true if showLocationBeforeGroup is false and isMobileView is true', () => {
      const { wrapper } = createWrapper({ storeOverrides: { isMobileView: true } });
      wrapper.vm.groupId = 2;
      expect(wrapper.vm.isReasonSelectEnabled).toBe(true);
    });

    it('returns false if showLocationBeforeGroup is false and isMobileView is false and group is not selected', () => {
      const { wrapper } = createWrapper({ storeOverrides: { isMobileView: false } });
      wrapper.vm.groupId = null;
      expect(wrapper.vm.isReasonSelectEnabled).toBe(false);
    });
  });

  describe('isPositionSelectEnabled', () => {
    it('returns true when showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeGroup: true } });
      expect(wrapper.vm.isPositionSelectEnabled).toBe(true);
    });

    it('returns true if showLocationBeforeReason is true and isMobileView is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true, isMobileView: true },
      });
      expect(wrapper.vm.isPositionSelectEnabled).toBe(true);
    });

    it('returns false if showLocationBeforeReason is true and isMobileView is false and group is not selected', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true, isMobileView: false },
      });
      wrapper.vm.groupId = null;
      expect(wrapper.vm.isPositionSelectEnabled).toBe(false);
    });

    it('returns true if showLocationBeforeReason is true and isMobileView is false and group is selected', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true, isMobileView: false },
      });
      wrapper.vm.groupId = 2;
      expect(wrapper.vm.isPositionSelectEnabled).toBe(true);
    });

    it('returns true when position select is shown last and selectedReason is set', () => {
      const { wrapper } = createWrapper({
        props: { selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false } },
      });
      expect(wrapper.vm.isPositionSelectEnabled).toBe(true);
    });

    it('returns false when position select is shown last and selectedReason is not set', () => {
      const { wrapper } = createWrapper({
        props: { selectedReason: { id: 0 } },
      });
      expect(wrapper.vm.isPositionSelectEnabled).toBe(false);
    });
  });

  describe('groupsVisible', () => {
    it('returns true when showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeGroup: true } });
      expect(wrapper.vm.groupsVisible).toBe(true);
    });

    it('returns true when showLocationBeforeReason is true', () => {
      const { wrapper } = createWrapper({ storeOverrides: { showLocationBeforeReason: true } });
      expect(wrapper.vm.groupsVisible).toBe(true);
    });

    it('returns true when filteredGroups has more than one group', () => {
      const { wrapper } = createWrapper({
        props: {
          reasons: [
            { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
          ],
          groups: [
            { id: 1, name: 'Group 1' },
            { id: 2, name: 'Group 2' },
          ],
          selectedReason: { id: 0 },
        },
      });
      expect(wrapper.vm.groupsVisible).toBe(true);
    });

    it('returns false when showLocationBeforeGroup is false and filteredGroups has one group', () => {
      const { wrapper } = createWrapper({
        props: {
          reasons: [
            { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
          ],
          groups: [
            { id: 1, name: 'Group 1' },
          ],
          selectedReason: { id: 0 },
        },
      });
      expect(wrapper.vm.groupsVisible).toBe(false);
    });
  });

  describe('numberOfSelectors', () => {
    it('returns 1 when only reason select is visible', () => {
      const { wrapper } = createWrapper({
        props: {
          positions: [],
          reasons: [{ id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }],
          groups: [{ id: 2, name: 'Group 2' }],
        },
      });
      expect(wrapper.vm.numberOfSelectors).toBe(1);
    });

    it('returns 2 when reason and position selects are visible', () => {
      const { wrapper } = createWrapper({
        props: {
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
          reasons: [{ id: 1, groupId: 2, name: 'Reason 1', requirePosition: false }],
          groups: [{ id: 2, name: 'Group 2' }],
        },
      });
      expect(wrapper.vm.numberOfSelectors).toBe(2);
    });

    it('returns 2 when group and reason selects are visible', () => {
      const { wrapper } = createWrapper({
        props: {
          positions: [],
          reasons: [
            { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: false },
          ],
          groups: [
            { id: 1, name: 'Group 1' },
            { id: 2, name: 'Group 2' },
          ],
        },
      });
      expect(wrapper.vm.numberOfSelectors).toBe(2);
    });

    it('returns 3 when group, reason and position selects are visible', () => {
      const { wrapper } = createWrapper({
        props: {
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
          reasons: [
            { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: false },
          ],
          groups: [
            { id: 1, name: 'Group 1' },
            { id: 2, name: 'Group 2' },
          ],
        },
      });
      expect(wrapper.vm.numberOfSelectors).toBe(3);
    });
  });

  describe('extraNoteRule', () => {
    it('returns true when extraNoteRequired is false and notes are empty', () => {
      const { wrapper } = createWrapper({ props: { extraNoteRequired: false, notes: '' } });
      expect(wrapper.vm.extraNoteRule).toEqual(true);
    });

    it('returns true when extraNoteRequired is false and notes are not empty', () => {
      const { wrapper } = createWrapper({ props: { extraNoteRequired: false, notes: 'note' } });
      expect(wrapper.vm.extraNoteRule).toEqual(true);
    });

    it('returns true when extraNoteRequired is true and notes are not empty', () => {
      const { wrapper } = createWrapper({ props: { extraNoteRequired: true, notes: 'note' } });
      expect(wrapper.vm.extraNoteRule).toEqual(true);
    });

    it('returns hint string when extraNoteRequired is true and notes are empty', () => {
      const { wrapper } = createWrapper({ props: { extraNoteRequired: true, notes: '' } });
      expect(wrapper.vm.extraNoteRule).toEqual('Extra note');
    });
  });

  describe('getSubtitle', () => {
    const { wrapper } = createWrapper({
      props: { groupsMap: { 2: { id: 2, name: 'Group 2' } } },
    });
    it('returns group name if item has groupId', () => {
      const item = { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false };
      expect(wrapper.vm.getSubtitle(item)).toBe('Group 2');
    });

    it('returns Machine location if item does not have groupId', () => {
      const item = { id: 1, name: 'Position 1' };
      expect(wrapper.vm.getSubtitle(item)).toBe('Machine location');
    });
  });

  test('that goToSettings calls window.open with correct parameters', () => {
    const { wrapper } = createWrapper({ props: { settingsModule: 'comments' } });
    const originalLocation = window.location;
    window.location = { ...originalLocation, origin: 'testorigin' };

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => { });

    wrapper.vm.goToSettings();

    expect(windowOpenSpy).toHaveBeenCalledWith('testorigin/#/settings/comments', '_blank');

    window.location = originalLocation;
  });

  describe('close', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });
    it('calls openPreviousDialog and clearSliceSelection if dialog previousState has component and sliceSelection is not empty', () => {
      const { wrapper, stores } = createWrapper({
        storeOverrides: {
          previousState: { component: 'component' },
          sliceSelection: [{ id: 1 }],
        },
      });

      wrapper.vm.close();

      expect(stores.genericDialogStore.openPreviousDialog).toHaveBeenCalled();
      expect(stores.genericDialogStore.closeDialog).not.toHaveBeenCalled();
      expect(stores.selectionStore.clearSliceSelection).toHaveBeenCalled();
    });

    it('calls closeDialog and clearSliceSelection if dialog previousState has component and sliceSelection is empty', () => {
      const { wrapper, stores } = createWrapper({
        storeOverrides: {
          previousState: { component: 'component' },
          sliceSelection: [],
        },
      });

      wrapper.vm.close();

      expect(stores.genericDialogStore.closeDialog).toHaveBeenCalled();
      expect(stores.genericDialogStore.openPreviousDialog).not.toHaveBeenCalled();
      expect(stores.selectionStore.clearSliceSelection).toHaveBeenCalled();
    });

    it('calls closeDialog and clearSliceSelection if dialog previousState does not have component, but slice selection is not empty', () => {
      const { wrapper, stores } = createWrapper({
        storeOverrides: {
          previousState: {},
          sliceSelection: [{ id: 1 }],
        },
      });

      wrapper.vm.close();

      expect(stores.genericDialogStore.closeDialog).toHaveBeenCalled();
      expect(stores.genericDialogStore.openPreviousDialog).not.toHaveBeenCalled();
      expect(stores.selectionStore.clearSliceSelection).toHaveBeenCalled();
    });

    it('calls closeDialog and clearSliceSelection if dialog previousState does not have component and slice selection is empty', () => {
      const { wrapper, stores } = createWrapper({
        storeOverrides: {
          previousState: {},
          sliceSelection: [],
        },
      });

      wrapper.vm.close();

      expect(stores.genericDialogStore.closeDialog).toHaveBeenCalled();
      expect(stores.genericDialogStore.openPreviousDialog).not.toHaveBeenCalled();
      expect(stores.selectionStore.clearSliceSelection).toHaveBeenCalled();
    });
  });

  describe('selectPosition', () => {
    it('sets isRequiredPositionMissing to false, emits correct position and reason ids and sets correct group id when showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: {
          positionId: 0,
          groupsMap: { 1: { id: 1, name: 'Group 1' } },
          groups: [{ id: 1, name: 'Group 1' }],
          reasons: [{ id: 1, groupId: 1, name: 'Reason 1', requirePosition: false }],
          reasonsMap: { 1: { id: 1, groupId: 1, name: 'Reason 1', requirePosition: false } },
        },
      });
      wrapper.vm.isRequiredPositionMissing = true;
      wrapper.vm.selectPosition(1);

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
      expect(wrapper.emitted()['update:position-id'][0]).toEqual([1]);
      expect(wrapper.vm.groupId).toBe(1);
      const emitted = wrapper.emitted()['update:reason-id'];
      expect(emitted[emitted.length - 1]).toEqual([null]);
    });

    it('sets isRequiredPositionMissing to false and emits correct position when showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({
        props: { positionId: 0 },
      });
      wrapper.vm.isRequiredPositionMissing = true;
      wrapper.vm.selectPosition(2);

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
      expect(wrapper.emitted()['update:position-id'][0]).toEqual([2]);
      expect(wrapper.vm.groupId).toBe(null);
      expect(wrapper.emitted()['update:reason-id']).toBeUndefined();
    });

    it('emits update:reason-id with null when showLocationBeforeReason is true and positionId is null', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeReason: true },
      });
      wrapper.vm.selectPosition(null);

      const emitted = wrapper.emitted()['update:reason-id'];
      expect(emitted[emitted.length - 1]).toEqual([null]);
    });
  });

  describe('selectReason', () => {
    it('emits correct reason id sets its groupId', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 0 },
          reasonsMap: {
            2: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          },
        },
      });

      wrapper.vm.selectReason(2);

      expect(wrapper.emitted()['update:reason-id'][0]).toEqual([2]);
      expect(wrapper.vm.groupId).toBe(3);
    });

    it('does not select groupId if called with null', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          reasonsMap: {
            1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          },
        },
      });

      wrapper.vm.groupId = 2;
      wrapper.vm.selectReason(null);

      expect(wrapper.emitted()['update:reason-id'][0]).toEqual([null]);
      expect(wrapper.vm.groupId).toBe(2);
    });

    it('sets isRequiredPositionMissing to false if selected reason does not have requirePosition', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 0 },
          reasonsMap: {
            1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          },
        },
      });

      wrapper.vm.isRequiredPositionMissing = true;
      wrapper.vm.selectReason(1);

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
    });

    it('keeps isRequiredPositionMissing as true if selected reason has requirePosition true', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 0 },
          reasonsMap: {
            2: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          },
        },
      });

      wrapper.vm.isRequiredPositionMissing = true;
      wrapper.vm.selectReason(2);

      expect(wrapper.vm.isRequiredPositionMissing).toBe(true);
    });

    it('emits update:position-id with null when showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 0 },
          reasonsMap: {
            1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          },
        },
      });

      wrapper.vm.selectReason(1);

      const emitted = wrapper.emitted()['update:position-id'];
      expect(emitted[emitted.length - 1]).toEqual([null]);
    });

    it('does not emit update:position-id when showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: {
          selectedReason: { id: 0 },
          reasonsMap: {
            1: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          },
        },
      });

      wrapper.vm.selectReason(1);

      expect(wrapper.emitted()['update:position-id']).toBeUndefined();
    });
  });

  describe('selectGroup', () => {
    it('sets groupId and emits update:reason-id with first reason id', () => {
      const { wrapper } = createWrapper({
        props: {
          reasons: [
            { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
          ],
        },
      });

      wrapper.vm.selectGroup(2);

      expect(wrapper.vm.groupId).toBe(2);
      expect(wrapper.emitted()['update:reason-id'][0]).toEqual([1]);
    });
    it('emits update:position-id with null when showLocationBeforeGroup is false', () => {
      const { wrapper } = createWrapper({
        props: {
          reasons: [
            { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
          ],
        },
      });

      wrapper.vm.selectGroup(2);
      const emitted = wrapper.emitted()['update:position-id'];
      expect(emitted[emitted.length - 1]).toEqual([null]);
    });

    it('does not emit update:position-id when showLocationBeforeGroup is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { showLocationBeforeGroup: true },
        props: {
          reasons: [
            { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
            { id: 2, groupId: 2, name: 'Reason 2', requirePosition: true },
          ],
        },
      });

      wrapper.vm.selectGroup(2);
      expect(wrapper.emitted()['update:position-id']).toBeUndefined();
    });
  });

  describe('setIsRequiredPositionMissing', () => {
    it('sets isRequiredPositionMissing to true if position is required, not set and there are positions defined', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          positionId: 0,
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
        },
      });

      wrapper.vm.setIsRequiredPositionMissing();

      expect(wrapper.vm.isRequiredPositionMissing).toBe(true);
    });

    it('sets isRequiredPositionMissing to false if position is required and set', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          positionId: 1,
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
        },
      });

      wrapper.vm.setIsRequiredPositionMissing();

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
    });
    it('sets isRequiredPositionMissing to false if position is not required', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          positionId: 0,
          positions: [{ id: 1, name: 'Position 1', commentIds: [] }],
        },
      });

      wrapper.vm.setIsRequiredPositionMissing();

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
    });

    it('sets isRequiredPositionMissing to false if there are no positions defined', () => {
      const { wrapper } = createWrapper({
        props: {
          selectedReason: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          positionId: 0,
          positions: [],
        },
      });

      wrapper.vm.setIsRequiredPositionMissing();

      expect(wrapper.vm.isRequiredPositionMissing).toBe(false);
    });
  });

  describe('onSave', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('does not call saveCallback if position is required but not set', async () => {
      const saveCallback = vi.fn();
      const { wrapper } = createWrapper({
        props: {
          saveCallback,
          selectedReason: { id: 2, groupId: 3, name: 'Reason 2', requirePosition: true },
          positionId: 0,
          loading: false,
        },
      });

      await wrapper.vm.onSave();

      expect(saveCallback).not.toHaveBeenCalled();
    });

    it('does not call saveCallback if selectedReason is not set', async () => {
      const saveCallback = vi.fn();
      const { wrapper } = createWrapper({
        props: {
          saveCallback,
          selectedReason: { id: 0 },
          saveLoading: false,
          positionId: 1,
        },
      });

      await wrapper.vm.onSave();

      expect(saveCallback).not.toHaveBeenCalled();
    });

    it('calls saveCallback if saveLoading is false and reason and position are set', async () => {
      const saveCallback = vi.fn().mockResolvedValue({ success: true });
      const { wrapper } = createWrapper({
        props: {
          saveCallback,
          selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          positionId: 1,
          saveLoading: 'test note',
        },
      });

      await wrapper.vm.onSave();

      expect(saveCallback).toHaveBeenCalledTimes(1);
    });

    it('calls notifyError when saveCallback is not successful', async () => {
      const saveCallback = vi.fn().mockResolvedValue({ success: false, message: 'Error message' });
      const { wrapper, stores } = createWrapper({
        props: {
          saveCallback,
          selectedReason: { id: 1, groupId: 2, name: 'Reason 1', requirePosition: false },
          positionId: 1,
          saveLoading: false,
        },
      });

      await wrapper.vm.onSave();

      expect(stores.notificationStore.notifyError).toHaveBeenCalledWith('Error message');
    });
  });

  test('that onDelete calls openConfirmDialog with correct parameters', async () => {
    const { wrapper, stores } = createWrapper({
      props: { deleteCallback: () => { } },
    });

    await wrapper.vm.onDelete();
    expect(stores.confirmDialogStore.openConfirmDialog).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'Are you sure you want to delete {value}?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      action: expect.any(Function),
      hasLoading: true,
    });
  });

  describe('deleteReason', () => {
    it('calls deleteCallback and notifyDeleted if deletion is successful', async () => {
      const deleteCallback = vi.fn().mockResolvedValue({ success: true });
      const { wrapper, stores } = createWrapper({
        props: { deleteCallback },
      });

      await wrapper.vm.deleteReason();

      expect(deleteCallback).toHaveBeenCalledTimes(1);
      expect(stores.notificationStore.notifyDeleted).toHaveBeenCalledTimes(1);
    });

    it('calls deleteCallback and notifyError if deletion is not successful', async () => {
      const deleteCallback = vi.fn().mockResolvedValue({ success: false, message: 'Error message' });
      const { wrapper, stores } = createWrapper({
        props: { deleteCallback },
      });

      await wrapper.vm.deleteReason();

      expect(deleteCallback).toHaveBeenCalledTimes(1);
      expect(stores.notificationStore.notifyError).toHaveBeenCalledTimes(1);
    });
  });
});
