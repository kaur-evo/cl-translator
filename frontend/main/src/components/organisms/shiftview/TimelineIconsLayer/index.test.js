import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPlaylistCheck, mdiAutorenew, mdiAccount, mdiImageOutline } from '@mdi/js';

import colorConstants from '@/constants/colorConstants';
import { checklistStatuses } from '@/constants/checklistsConstants';
import { pinTypes } from '@/constants/shiftviewPinConstants';
import TimelineIconsLayer from '@/components/organisms/shiftview/TimelineIconsLayer/index.vue';
import { eventBus } from '@/eventBus';
import shiftviewDialogs from '@/constants/dialogConfigs';
import {
  useProfileStore, useShiftStore, useShiftviewTimelineStore, useShiftviewSelectionStore,
  useChecklistTaskStore, useStationStore, useDeviceStore, useUserPreferencesStore, useGenericDialogStore,
} from '@/stores/index';

vi.mock('@/eventBus');
eventBus.$emit = vi.fn();

const target = document.createElement('div');

const propsDefault = {
  shiftHours: [
    { dateTime: '2020-12-12T10:00:00.000+02:00' },
    { dateTime: '2020-12-12T11:00:00.000+02:00' },
    { dateTime: '2020-12-12T12:00:00.000+02:00' },
    { dateTime: '2020-12-12T13:00:00.000+02:00' },
    { dateTime: '2020-12-12T14:00:00.000+02:00' },
    { dateTime: '2020-12-12T15:00:00.000+02:00' },
    { dateTime: '2020-12-12T16:00:00.000+02:00' },
    { dateTime: '2020-12-12T17:00:00.000+02:00' },
    { dateTime: '2020-12-12T18:00:00.000+02:00' },
    { dateTime: '2020-12-12T19:00:00.000+02:00' },
    { dateTime: '2020-12-12T20:00:00.000+02:00' },
  ],
};

const createWrapper = (mountFn, { storeOverrides = {}, props = {}, options = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = storeOverrides.shift ?? {};
  shiftStore.isShiftRunning = storeOverrides.isShiftRunning ?? false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 1, zoneId: 'Europe/Tallinn' };

  const profileStore = useProfileStore(pinia);
  vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(storeOverrides.isReadOnly ?? false);

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.teamTimeline = storeOverrides.teamTimeline ?? [];
  shiftviewTimelineStore.batchTargetFlags = storeOverrides.batchTargetFlags ?? [];

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  vi.spyOn(shiftviewSelectionStore, 'isSelectionActive', 'get').mockReturnValue(storeOverrides.isSelectionActive ?? false);
  shiftviewSelectionStore.selectedPinItems = storeOverrides.selectedPinItems ?? [];

  const checklistTaskStore = useChecklistTaskStore(pinia);
  checklistTaskStore.checklistTasks = storeOverrides.checklistTasks ?? [];

  const deviceStore = useDeviceStore(pinia);
  vi.spyOn(deviceStore, 'screenWidth', 'get').mockReturnValue(storeOverrides.screenWidth ?? 1920);

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = storeOverrides.viewSettings ?? { hideChecklists: false };

  // genericDialog and genericNotification actions are auto-stubbed by createTestingPinia

  return mountFn(TimelineIconsLayer, {
    global: { plugins: [pinia] },
    props,
    ...options,
  });
};

describe('TimelineIconsLayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(cb, 0);
      return 0;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  it('renders correctly if checklist pins are visible', async () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00', elements: [], fileCount: 2 },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00', elements: [], fileCount: 1 },
          { dateTimeISO: '2020-12-12T15:00:00.000+02:00', elements: [], fileCount: 0 },
          { dateTimeISO: '2020-12-12T20:00:00.000+02:00', elements: [], fileCount: 0 },
        ],
      },
      props: { ...propsDefault },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly if checklist pins are hidden', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00', elements: [] },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00', elements: [] },
          { dateTimeISO: '2020-12-12T15:00:00.000+02:00', elements: [] },
          { dateTimeISO: '2020-12-12T20:00:00.000+02:00', elements: [] },
        ],
        viewSettings: { hideChecklists: true },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('calls read-only error, if user is in read-only mode', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: { isReadOnly: true },
    });

    const notifyError = vi.spyOn(wrapper.vm, 'notifyError');
    wrapper.vm.clickIcon({ target }, [{ type: 'testType' }]);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenCalledWith('You are in read-only mode');
  });

  it('does not call read-only error, if user is in read-only mode and icon type is CHECK', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: { isReadOnly: true },
    });

    const notifyError = vi.spyOn(wrapper.vm, 'notifyError');
    wrapper.vm.clickIcon({ target }, [{ type: pinTypes.CHECK }]);
    expect(notifyError).toHaveBeenCalledTimes(0);
  });

  it('doesnt request operator on clickIcon if requestOperator is false', () => {
    const wrapper = createWrapper(mount);
    const spy = vi.spyOn(wrapper.vm, 'requestOperator');
    wrapper.vm.clickIcon(undefined, [{ type: 'testType' }]);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('requests operator on clickIcon if requestOperator is false', () => {
    const wrapper = createWrapper(mount, {
      props: { requireOperator: true },
    });
    const spy = vi.spyOn(wrapper.vm, 'requestOperator');
    wrapper.vm.clickIcon([{ type: 'testType' }]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('getIcon', () => {
    const wrapper = createWrapper(mount);

    expect(wrapper.vm.getIcon({ type: pinTypes.CHECK })).toBe(mdiPlaylistCheck);
    expect(wrapper.vm.getIcon({ type: pinTypes.TEAM })).toBe(mdiAccount);
    expect(wrapper.vm.getIcon({ type: pinTypes.CHANGEOVER })).toBe(mdiAutorenew);
    expect(wrapper.vm.getIcon({ type: 'something else' })).toBe('');
    expect(wrapper.vm.getIcon({})).toBe('');
  });

  test('getChecklistIcons', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00.000+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00' },
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00' },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00' },
          { dateTimeISO: '2020-12-12T15:00:00.000+02:00' },
          { dateTimeISO: '2020-12-12T20:00:00.000+02:00' },
        ],
      },
    });

    expect(wrapper.vm.getChecklistIcons()).toEqual([
      { type: pinTypes.CHECK, check: { dateTimeISO: '2020-12-12T10:00:00.000+02:00' }, time: '2020-12-12T10:00:00.000+02:00' },
      { type: pinTypes.CHECK, check: { dateTimeISO: '2020-12-12T10:00:00.000+02:00' }, time: '2020-12-12T10:00:00.000+02:00' },
      { type: pinTypes.CHECK, check: { dateTimeISO: '2020-12-12T11:00:00.000+02:00' }, time: '2020-12-12T11:00:00.000+02:00' },
      { type: pinTypes.CHECK, check: { dateTimeISO: '2020-12-12T15:00:00.000+02:00' }, time: '2020-12-12T15:00:00.000+02:00' },
      { type: pinTypes.CHECK, check: { dateTimeISO: '2020-12-12T19:59:59.000+02:00' }, time: '2020-12-12T19:59:59.000+02:00' },
    ]);
  });

  test('getChecklistIcons with empty checklists', () => {
    const wrapper = createWrapper(mount);

    expect(wrapper.vm.getChecklistIcons()).toEqual([]);
  });

  test('getChecklistIcons filters by visibleChecklistIdsByStation', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00.000+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00', checklistId: 'c1' },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00', checklistId: 'c2' },
          { dateTimeISO: '2020-12-12T15:00:00.000+02:00', checklistId: 'c1' },
          { dateTimeISO: '2020-12-12T16:00:00.000+02:00', checklistId: 'c3' },
        ],
        viewSettings: {
          hideChecklists: false,
          visibleChecklistIdsByStation: { 1: ['c1'] },
        },
      },
    });

    const result = wrapper.vm.getChecklistIcons();

    expect(result).toHaveLength(2);
    expect(result[0].check.checklistId).toBe('c1');
    expect(result[1].check.checklistId).toBe('c1');
  });

  test('getChecklistIcons shows all checklists when station not in map', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00.000+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00', checklistId: 'c1' },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00', checklistId: 'c2' },
          { dateTimeISO: '2020-12-12T15:00:00.000+02:00', checklistId: 'c3' },
        ],
        viewSettings: {
          hideChecklists: false,
          visibleChecklistIdsByStation: {},
        },
      },
    });

    const result = wrapper.vm.getChecklistIcons();

    expect(result).toHaveLength(3);
  });

  test('getChecklistIcons handles undefined visibleChecklistIdsByStation', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        shift: { endTimeISO: '2020-12-12T20:00:00.000+02:00' },
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00.000+02:00', checklistId: 'c1' },
          { dateTimeISO: '2020-12-12T11:00:00.000+02:00', checklistId: 'c2' },
        ],
        viewSettings: {
          hideChecklists: false,
        },
      },
    });

    const result = wrapper.vm.getChecklistIcons();

    expect(result).toHaveLength(2);
  });

  test('getTeamIcons', () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        teamTimeline: [
          { startTimeISO: '2020-12-12T20:00:00+02:00' }, { startTimeISO: '2020-12-12T21:00:00+02:00' }, { startTimeISO: '2020-12-12T22:00:00+02:00' }, { startTimeISO: '2020-12-12T23:00:00+02:00' },
        ],
      },
    });

    expect(wrapper.vm.getTeamIcons()).toEqual([
      { type: pinTypes.TEAM, team: { startTimeISO: '2020-12-12T20:00:00+02:00', order: 0 }, time: '2020-12-12T20:00:00+02:00' },
      { type: pinTypes.TEAM, team: { startTimeISO: '2020-12-12T21:00:00+02:00', order: 1 }, time: '2020-12-12T21:00:00+02:00' },
      { type: pinTypes.TEAM, team: { startTimeISO: '2020-12-12T22:00:00+02:00', order: 2 }, time: '2020-12-12T22:00:00+02:00' },
      { type: pinTypes.TEAM, team: { startTimeISO: '2020-12-12T23:00:00+02:00', order: 3 }, time: '2020-12-12T23:00:00+02:00' },
    ]);
  });

  test('getTeamIcons without any teams added', () => {
    const wrapper = createWrapper(mount);

    expect(wrapper.vm.getTeamIcons()).toEqual([]);
  });

  test('getChangeOverIcons', () => {
    const wrapper = createWrapper(mount, {
      props: {
        changeovers: [
          {
            type: 'PRODUCT', sliceStartTmISO: '2020-12-12T17:15:00.000+02:00', sliceEndTmISO: '2020-12-12T17:16:00.000+02:00', duration: 60,
          },
          {
            type: 'STOPPAGE', sliceStartTmISO: '2020-12-12T18:00:00.000+02:00', sliceEndTmISO: '2020-12-12T18:30:00.000+02:00', duration: 1800,
          },
          {
            type: 'PRODUCT', sliceStartTmISO: '2020-12-12T19:59:00.000+02:00', sliceEndTmISO: '2020-12-12T19:59:10.000+02:00', duration: 10,
          },
          {
            type: 'STOPPAGE', sliceStartTmISO: '2020-12-12T20:00:00.000+02:00', sliceEndTmISO: '2020-12-12T20:00:15.000+02:00', duration: 15,
          },
        ],
      },
    });

    expect(wrapper.vm.getChangeOverIcons()).toEqual([
      {
        type: pinTypes.CHANGEOVER,
        slice: {
          type: 'PRODUCT',
          sliceStartTmISO: '2020-12-12T17:15:00.000+02:00',
          sliceEndTmISO: '2020-12-12T17:16:00.000+02:00',
          duration: 60,
        },
        time: '2020-12-12T17:15:10.000+02:00',
      },
      {
        type: pinTypes.CHANGEOVER,
        slice: {
          type: 'STOPPAGE',
          sliceStartTmISO: '2020-12-12T18:00:00.000+02:00',
          sliceEndTmISO: '2020-12-12T18:30:00.000+02:00',
          duration: 1800,
        },
        time: '2020-12-12T18:00:10.000+02:00',
      },
      {
        type: pinTypes.CHANGEOVER,
        slice: {
          type: 'PRODUCT',
          sliceStartTmISO: '2020-12-12T19:59:00.000+02:00',
          sliceEndTmISO: '2020-12-12T19:59:10.000+02:00',
          duration: 10,
        },
        time: '2020-12-12T19:59:00.000+02:00',
      },
      {
        type: pinTypes.CHANGEOVER,
        slice: {
          type: 'STOPPAGE',
          sliceStartTmISO: '2020-12-12T20:00:00.000+02:00',
          sliceEndTmISO: '2020-12-12T20:00:15.000+02:00',
          duration: 15,
        },
        time: '2020-12-12T20:00:00.000+02:00',
      },
    ]);
  });

  test('getChangeOverIcons without any changeovers added', () => {
    const wrapper = createWrapper(mount);

    expect(wrapper.vm.getChangeOverIcons()).toEqual([]);
  });

  test('getIconColor', () => {
    const wrapper = createWrapper(mount);

    expect(wrapper.vm.getIconColor([{ type: pinTypes.TEAM }])).toBe(colorConstants.dark.primary);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHANGEOVER }])).toBe(colorConstants.dark['lw-blue']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHECK, check: { status: checklistStatuses.UNSUCCESSFUL } }])).toBe(colorConstants.dark['lw-orange']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHECK, check: { status: checklistStatuses.SUCCESSFUL } }])).toBe(colorConstants.dark.primary);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHECK, check: { status: checklistStatuses.NEW } }])).toBe(colorConstants.dark['lw-gray']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHECK, check: { status: checklistStatuses.MISSED } }])).toBe(colorConstants.dark['lw-red']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.TEAM }, { type: pinTypes.CHANGEOVER }])).toBe(colorConstants.dark['lw-purple']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.TEAM }, { type: pinTypes.CHECK, check: { status: checklistStatuses.SUCCESSFUL } }])).toBe(colorConstants.dark.primary);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.TEAM }, { type: pinTypes.CHECK, check: { status: checklistStatuses.UNSUCCESSFUL } }])).toBe(colorConstants.dark['lw-purple']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHANGEOVER }, { type: pinTypes.CHANGEOVER }])).toBe(colorConstants.dark['lw-blue']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHANGEOVER }, { type: pinTypes.CHECK, check: { status: checklistStatuses.NEW } }])).toBe(colorConstants.dark['lw-purple']);
    expect(wrapper.vm.getIconColor(
      [{ type: pinTypes.CHECK, check: { status: checklistStatuses.UNSUCCESSFUL } }, { type: pinTypes.CHECK, check: { status: checklistStatuses.UNSUCCESSFUL } }],
    )).toBe(colorConstants.dark['lw-orange']);
    expect(wrapper.vm.getIconColor(
      [{ type: pinTypes.CHECK, check: { status: checklistStatuses.UNSUCCESSFUL } }, { type: pinTypes.CHECK, check: { status: checklistStatuses.NEW } }],
    )).toBe(colorConstants.dark['lw-purple']);
    expect(wrapper.vm.getIconColor(
      [{ type: pinTypes.CHECK, check: { status: checklistStatuses.SUCCESSFUL } }, { type: pinTypes.CHECK, check: { status: checklistStatuses.SUCCESSFUL } }],
    )).toBe(colorConstants.dark.primary);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.CHANGEOVER }, { type: pinTypes.BATCH_TARGET_REACHED }])).toBe(colorConstants.dark['lw-blue']);
    expect(wrapper.vm.getIconColor([{ type: pinTypes.BATCH_TARGET_REACHED }])).toBe(colorConstants.dark['lw-blue']);
  });

  test('allIcons', async () => {
    const wrapper = createWrapper(mount, {
      storeOverrides: {
        checklistTasks: [
          { dateTimeISO: '2020-12-12T10:00:00+02:00' },
          { dateTimeISO: '2020-12-12T10:00:00+02:00' },
          { dateTimeISO: '2020-12-12T11:00:00+02:00' },
          { dateTimeISO: '2020-12-12T15:00:00+02:00' },
          { dateTimeISO: '2020-12-12T20:00:00+02:00' },
        ],
        teamTimeline: [
          { startTimeISO: '2020-12-12T09:00:00.000+02:00' },
          { startTimeISO: '2020-12-12T14:00:00.000+02:00' },
          { startTimeISO: '2020-12-12T20:30:00.000+02:00' },
          { startTimeISO: '2020-12-12T23:00:00.000+02:00' },
        ],
      },
      props: {
        changeovers: [
          {
            type: 'PRODUCT', sliceStartTmISO: '2020-12-12T11:15:00.000+02:00', sliceEndTmISO: '2020-12-12T11:16:00.000+02:00', duration: 60,
          },
          {
            type: 'STOPPAGE', sliceStartTmISO: '2020-12-12T18:00:00.000+02:00', sliceEndTmISO: '2020-12-12T18:30:00.000+02:00', duration: 1800,
          },
          {
            type: 'PRODUCT', sliceStartTmISO: '2020-12-12T19:59:00.000+02:00', sliceEndTmISO: '2020-12-12T20:00:00.000+02:00', duration: 60,
          },
        ],
      },
    });

    expect(wrapper.vm.allIcons.map(({ type, time }) => ({ type, time }))).toEqual([
      { type: pinTypes.TEAM, time: '2020-12-12T09:00:00.000+02:00' },
      { type: pinTypes.CHECK, time: '2020-12-12T10:00:00.000+02:00' },
      { type: pinTypes.CHECK, time: '2020-12-12T10:00:00.000+02:00' },
      { type: pinTypes.CHECK, time: '2020-12-12T11:00:00.000+02:00' },
      { type: pinTypes.CHANGEOVER, time: '2020-12-12T11:15:10.000+02:00' },
      { type: pinTypes.TEAM, time: '2020-12-12T14:00:00.000+02:00' },
      { type: pinTypes.CHECK, time: '2020-12-12T15:00:00.000+02:00' },
      { type: pinTypes.CHANGEOVER, time: '2020-12-12T18:00:10.000+02:00' },
      { type: pinTypes.CHANGEOVER, time: '2020-12-12T19:59:10.000+02:00' },
      { type: pinTypes.CHECK, time: '2020-12-12T20:00:00.000+02:00' },
      { type: pinTypes.TEAM, time: '2020-12-12T20:30:00.000+02:00' },
      { type: pinTypes.TEAM, time: '2020-12-12T23:00:00.000+02:00' },
    ]);
  });

  test('groupedIcons', () => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({ width: 3600 })); // 1s = 1px
    const pinia = createTestingPinia({ createSpy: vi.fn });

    const stationStore = useStationStore(pinia);
    stationStore.lineviewStation = { id: 1, zoneId: 'Europe/Tallinn' };

    const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
    shiftviewTimelineStore.teamTimeline = [];
    shiftviewTimelineStore.batchTargetFlags = [];

    const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
    vi.spyOn(shiftviewSelectionStore, 'isSelectionActive', 'get').mockReturnValue(false);
    shiftviewSelectionStore.selectedPinItems = [];

    const checklistTaskStore = useChecklistTaskStore(pinia);
    checklistTaskStore.checklistTasks = [];

    const shiftStore = useShiftStore(pinia);
    shiftStore.shift = {};

    const profileStore = useProfileStore(pinia);
    vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(false);

    const deviceStore = useDeviceStore(pinia);
    vi.spyOn(deviceStore, 'screenWidth', 'get').mockReturnValue(1920);

    const userPreferencesStore = useUserPreferencesStore(pinia);
    userPreferencesStore.viewSettings = { hideChecklists: false };

    const wrapper = mount(TimelineIconsLayer, {
      global: { plugins: [pinia] },
      computed: {
        ...TimelineIconsLayer.computed,
        minIconDistance() {
          return 9; // stack the ones that are closer than 9s/9px
        },
        allIcons() {
          return [
            { type: pinTypes.CHECK, time: '2020-12-12T12:00:00+02:00', check: { id: 1 } }, // separate
            { type: pinTypes.CHANGEOVER, time: '2020-12-12T12:10:00+02:00', slice: { id: 2 } }, // stacked with next
            { type: pinTypes.CHECK, time: '2020-12-12T12:10:01+02:00', check: { id: 3 } }, // stacked with prev
            { type: pinTypes.TEAM, time: '2020-12-12T12:30:00+02:00', team: { id: 4 } }, // separate
            { type: pinTypes.CHECK, time: '2020-12-12T13:12:00+02:00', check: { id: 5 } }, // stacked with next
            { type: pinTypes.CHANGEOVER, time: '2020-12-12T13:12:02+02:00', team: { id: 6 } }, // stacked with prev
            { type: pinTypes.CHECK, time: '2020-12-12T13:45:00+02:00', check: { id: 7 } }, // separate
            { type: pinTypes.CHECK, time: '2020-12-12T14:10:00+02:00', check: { id: 8 } }, // stacked with next
            { type: pinTypes.CHECK, time: '2020-12-12T14:10:05+02:00', check: { id: 9 } }, // stacked with prev
            { type: pinTypes.CHECK, time: '2020-12-12T14:10:10+02:00', check: { id: 10 } }, // separate
            { type: pinTypes.TEAM, time: '2020-12-12T14:30:00+02:00', team: { id: 11 } }, // separate
            { type: pinTypes.CHECK, time: '2020-12-12T15:50:00+02:00', check: { id: 12 } }, // stacked with next 2
            { type: pinTypes.CHANGEOVER, time: '2020-12-12T15:50:04+02:00', check: { id: 13 } }, // stackew with prev and next
            { type: pinTypes.CHECK, time: '2020-12-12T15:50:08+02:00', check: { id: 14 } }, // stacked with prev 2
            { type: pinTypes.CHECK, time: '2020-12-12T15:59:59+02:00', check: { id: 15 } }, // separate
            { type: pinTypes.CHECK, time: '2020-12-12T16:00:01+02:00', check: { id: 16 } }, // separate
            { type: pinTypes.CHECK, time: '2020-12-12T16:10:00+02:00', check: { id: 17 } }, // stacked together with 17-21
            { type: pinTypes.CHANGEOVER, time: '2020-12-12T16:10:01+02:00', check: { id: 18 } }, // stacked together with 17-21
            { type: pinTypes.CHECK, time: '2020-12-12T16:10:02+02:00', check: { id: 19 } }, // stacked together with 17-21
            { type: pinTypes.CHANGEOVER, time: '2020-12-12T16:10:03+02:00', check: { id: 20 } }, // stacked together with 17-21
            { type: pinTypes.CHECK, time: '2020-12-12T16:10:04+02:00', check: { id: 21 } }, // stacked together with 17-21

          ];
        },
      },
    });

    expect(wrapper.vm.groupedIcons).toEqual({
      '2020-12-12T12:00:00.000+02:00': {
        '2020-12-12T12:00:00+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T12:00:00+02:00', check: { id: 1 } }],
        '2020-12-12T12:10:00+02:00': [
          { type: pinTypes.CHANGEOVER, time: '2020-12-12T12:10:00+02:00', slice: { id: 2 } },
          { type: pinTypes.CHECK, time: '2020-12-12T12:10:01+02:00', check: { id: 3 } },
        ],
        '2020-12-12T12:30:00+02:00': [{ type: pinTypes.TEAM, time: '2020-12-12T12:30:00+02:00', team: { id: 4 } }],
      },
      '2020-12-12T13:00:00.000+02:00': {
        '2020-12-12T13:12:02+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T13:12:00+02:00', check: { id: 5 } }, { type: pinTypes.CHANGEOVER, time: '2020-12-12T13:12:02+02:00', team: { id: 6 } }],
        '2020-12-12T13:45:00+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T13:45:00+02:00', check: { id: 7 } }],
      },
      '2020-12-12T14:00:00.000+02:00': {
        '2020-12-12T14:10:00+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T14:10:00+02:00', check: { id: 8 } }, { type: pinTypes.CHECK, time: '2020-12-12T14:10:05+02:00', check: { id: 9 } }],
        '2020-12-12T14:10:10+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T14:10:10+02:00', check: { id: 10 } }],
        '2020-12-12T14:30:00+02:00': [{ type: pinTypes.TEAM, time: '2020-12-12T14:30:00+02:00', team: { id: 11 } }],
      },
      '2020-12-12T15:00:00.000+02:00': {
        '2020-12-12T15:50:04+02:00': [
          { type: pinTypes.CHECK, time: '2020-12-12T15:50:00+02:00', check: { id: 12 } },
          { type: pinTypes.CHANGEOVER, time: '2020-12-12T15:50:04+02:00', check: { id: 13 } },
          { type: pinTypes.CHECK, time: '2020-12-12T15:50:08+02:00', check: { id: 14 } },
        ],
        '2020-12-12T15:59:59+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T15:59:59+02:00', check: { id: 15 } }],
      },
      '2020-12-12T16:00:00.000+02:00': {
        '2020-12-12T16:00:01+02:00': [{ type: pinTypes.CHECK, time: '2020-12-12T16:00:01+02:00', check: { id: 16 } }],
        '2020-12-12T16:10:01+02:00': [
          { type: pinTypes.CHECK, time: '2020-12-12T16:10:00+02:00', check: { id: 17 } },
          { type: pinTypes.CHANGEOVER, time: '2020-12-12T16:10:01+02:00', check: { id: 18 } },
          { type: pinTypes.CHECK, time: '2020-12-12T16:10:02+02:00', check: { id: 19 } },
          { type: pinTypes.CHANGEOVER, time: '2020-12-12T16:10:03+02:00', check: { id: 20 } },
          { type: pinTypes.CHECK, time: '2020-12-12T16:10:04+02:00', check: { id: 21 } },
        ],
      },
    });
  });

  test('that clickIcon calls selectPin with pin items', () => {
    const wrapper = createWrapper(shallowMount);

    const selectPin = vi.spyOn(wrapper.vm, 'selectPin');

    const icons = [{ type: pinTypes.CHECK, check: { status: checklistStatuses.NEW }, time: '2020-02-02T12:00:00+02:00' }, { type: pinTypes.CHANGEOVER, slice: {}, time: '2020-02-02T12:00:00+02:00' }];

    expect(wrapper.vm.selectedPinItems).toEqual([]);

    wrapper.vm.clickIcon({ target }, icons);
    expect(selectPin).toHaveBeenCalledTimes(1);
    expect(selectPin).toHaveBeenCalledWith(icons);
  });

  test('that onPinHover sets hoveredPinTimeStamp to null and calls eventBus.$emit correctly if input is null', async () => {
    const wrapper = createWrapper(shallowMount);

    await wrapper.setData({ hoveredPinTimeStamp: 'teststamp' });
    await wrapper.vm.onPinHover(null, null);
    vi.runAllTimers();
    expect(wrapper.vm.hoveredPinTimeStamp).toBe(null);
    expect(eventBus.$emit).toHaveBeenCalledWith('changeover-hover', null);
  });

  test('that onPinHover sets hoveredPinTimeStamp and doesnt call eventbus.$emit if multiple pins are hovered', async () => {
    const wrapper = createWrapper(shallowMount);

    await wrapper.vm.onPinHover({ clientX: 0, clientY: 0 }, [{ batchId: 123 }, { batchId: 242 }], 'teststamp');
    vi.runAllTimers();
    expect(wrapper.vm.hoveredPinTimeStamp).toBe('teststamp');
    expect(eventBus.$emit).toHaveBeenCalledTimes(0);
  });

  test('that onPinHover sets hoveredPinTimeStamp and doesnt call eventbus.$emit if one pin is hovered, but not checklist', async () => {
    const wrapper = createWrapper(shallowMount);

    await wrapper.vm.onPinHover({ clientX: 0, clientY: 0 }, [{ batchId: 123, type: 'random' }], 'teststamp');
    vi.runAllTimers();
    expect(wrapper.vm.hoveredPinTimeStamp).toBe('teststamp');
    expect(eventBus.$emit).toHaveBeenCalledTimes(0);
  });

  test('that onPinHover sets hoveredPinTimeStamp and calls eventbus.$emit correctly if check pin is hovered', async () => {
    const wrapper = createWrapper(shallowMount);

    await wrapper.vm.onPinHover({ clientX: 0, clientY: 0 }, [{ slice: { batchId: 123 }, type: pinTypes.CHANGEOVER }], 'teststamp');
    vi.runAllTimers();
    expect(wrapper.vm.hoveredPinTimeStamp).toBe('teststamp');
    expect(eventBus.$emit).toHaveBeenCalledTimes(1);
    expect(eventBus.$emit).toHaveBeenCalledWith('changeover-hover', 123);
  });

  test('that onPinHover sets tooltipVisible to true and updates x/y coordinates', async () => {
    const wrapper = createWrapper(shallowMount);

    const event = { clientX: 100, clientY: 200 };
    await wrapper.vm.onPinHover(event, [{ type: pinTypes.CHANGEOVER, slice: { batchId: 123 } }], 'teststamp');
    vi.runAllTimers();

    expect(wrapper.vm.tooltipVisible).toBe(true);
    expect(wrapper.vm.x).toBe(100);
    expect(wrapper.vm.y).toBe(200);
  });

  test('that onPinHover sets tooltipVisible to false when event is null', async () => {
    const wrapper = createWrapper(shallowMount);

    await wrapper.setData({ tooltipVisible: true, x: 100, y: 200 });
    await wrapper.vm.onPinHover(null, null, null);
    vi.runAllTimers();

    expect(wrapper.vm.tooltipVisible).toBe(false);
    expect(wrapper.vm.x).toBe(0);
    expect(wrapper.vm.y).toBe(0);
  });

  test('that clickChangeover calls selectSlice and openDialog with correct params', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });

    const stationStore = useStationStore(pinia);
    stationStore.lineviewStation = { id: 1, zoneId: 'Europe/Tallinn' };

    const shiftStore = useShiftStore(pinia);
    shiftStore.shift = {};

    const profileStore = useProfileStore(pinia);
    vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(false);

    const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
    shiftviewTimelineStore.teamTimeline = [];
    shiftviewTimelineStore.batchTargetFlags = [];

    const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
    vi.spyOn(shiftviewSelectionStore, 'isSelectionActive', 'get').mockReturnValue(false);
    shiftviewSelectionStore.selectedPinItems = [];

    const checklistTaskStore = useChecklistTaskStore(pinia);
    checklistTaskStore.checklistTasks = [];

    const deviceStore = useDeviceStore(pinia);
    vi.spyOn(deviceStore, 'screenWidth', 'get').mockReturnValue(1920);

    const userPreferencesStore = useUserPreferencesStore(pinia);
    userPreferencesStore.viewSettings = { hideChecklists: false };

    const genericDialogStore = useGenericDialogStore(pinia);

    const wrapper = shallowMount(TimelineIconsLayer, {
      global: { plugins: [pinia] },
    });

    const slice = {
      sliceStartTmISO: '2024-12-30T12:00:00.000', sliceEndTmISO: '2024-12-30T12:00:44.000', isProductChange: true, batchId: 123,
    };
    wrapper.vm.clickChangeover(slice);
    expect(shiftviewSelectionStore.selectSlice).toHaveBeenCalledTimes(1);
    expect(shiftviewSelectionStore.selectSlice).toHaveBeenCalledWith({ ...slice, isPin: true });
    expect(genericDialogStore.openDialog).toHaveBeenCalledTimes(1);
    expect(genericDialogStore.openDialog).toHaveBeenCalledWith(shiftviewDialogs.CHANGEOVER);
  });

  describe('appendSize', () => {
    function factory({ xs = false, screenWidth = 1920 } = {}) {
      const pinia = createTestingPinia({ createSpy: vi.fn });

      const stationStore = useStationStore(pinia);
      stationStore.lineviewStation = { id: 1, zoneId: 'Europe/Tallinn' };

      const shiftStore = useShiftStore(pinia);
      shiftStore.shift = {};

      const profileStore = useProfileStore(pinia);
      vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(false);

      const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
      shiftviewTimelineStore.teamTimeline = [];
      shiftviewTimelineStore.batchTargetFlags = [];

      const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
      vi.spyOn(shiftviewSelectionStore, 'isSelectionActive', 'get').mockReturnValue(false);
      shiftviewSelectionStore.selectedPinItems = [];

      const checklistTaskStore = useChecklistTaskStore(pinia);
      checklistTaskStore.checklistTasks = [];

      const deviceStore = useDeviceStore(pinia);
      vi.spyOn(deviceStore, 'screenWidth', 'get').mockReturnValue(screenWidth);

      const userPreferencesStore = useUserPreferencesStore(pinia);
      userPreferencesStore.viewSettings = { hideChecklists: false };

      const wrapper = shallowMount(TimelineIconsLayer, {
        global: {
          plugins: [pinia],
          mocks: {
            $vuetify: { display: { xs } },
          },
        },
      });
      wrapper.vm.$vuetify.display.xs = xs;
      return wrapper;
    }

    it('returns 9 if xs display is true', () => {
      const wrapper = factory({ xs: true, screenWidth: 1000 });
      expect(wrapper.vm.appendSize).toBe(9);
    });

    it('returns 14 if screenWidth >= 3840 and xs is false', () => {
      const wrapper = factory({ xs: false, screenWidth: 4000 });
      expect(wrapper.vm.appendSize).toBe(14);
    });

    it('returns 12 for normal screens', () => {
      const wrapper = factory({ xs: false, screenWidth: 1920 });
      expect(wrapper.vm.appendSize).toBe(12);
    });
  });

  describe('getAppendIcon', () => {
    const wrapper = createWrapper(shallowMount);

    it('returns correct icon for multiple icons if one has files added', () => {
      const icons = [{ type: pinTypes.CHECK, time: '2020-12-12T14:10:00+02:00', check: { id: 8 } }, { type: pinTypes.CHECK, time: '2020-12-12T14:10:05+02:00', check: { id: 9, fileCount: 2 } }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe(mdiImageOutline);
    });

    it('returns empty string for multiple icons if none have files added', () => {
      const icons = [{ type: pinTypes.CHANGEOVER, time: '2020-12-12T14:10:00+02:00' }, { type: pinTypes.CHECK, time: '2020-12-12T14:10:05+02:00', check: { id: 9 } }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns empty string for unknown icon type', () => {
      const icons = [{ type: 'random', time: '2020-12-12T14:10:00+02:00', check: { id: 8 } }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns empty string for CHANGEOVER', () => {
      const icons = [{ type: pinTypes.CHANGEOVER, time: '2020-12-12T14:10:00+02:00' }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns empty string for TEAM', () => {
      const icons = [{ type: pinTypes.TEAM, time: '2020-12-12T14:10:00+02:00' }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns empty string for BATCH_TARGET_REACHED', () => {
      const icons = [{ type: pinTypes.BATCH_TARGET_REACHED, time: '2020-12-12T14:10:00+02:00' }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns empty string for CHECK without files', () => {
      const icons = [{ type: pinTypes.CHECK, time: '2020-12-12T14:10:00+02:00', check: { id: 8, fileCount: 0 } }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe('');
    });

    it('returns correct icon for CHECK with files', () => {
      const icons = [{ type: pinTypes.CHECK, time: '2020-12-12T14:10:00+02:00', check: { id: 8, fileCount: 2 } }];
      expect(wrapper.vm.getAppendIcon(icons)).toBe(mdiImageOutline);
    });
  });
});
