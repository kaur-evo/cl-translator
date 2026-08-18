import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';
import { mdiPencil, mdiChevronRight, mdiDelete } from '@mdi/js';

import ChecklistOverviewDialog from './index.vue';
import {
  defaultChecklistTasks, getDefaultShift,
  TEST_STATION_ID, TEST_CHECKLIST_ID_1, TEST_CHECKLIST_ID_2,
  TEST_CHECKLIST_TASKS_COUNT, TEST_CHECKLIST_1_TASKS_COUNT,
} from './testStore';

import { useProfileStore, useDeviceStore, useShiftviewTimelineStore } from '@/stores/index';
import { checklistStatuses } from '@/constants/checklistsConstants';
import shiftviewDialogs from '@/constants/dialogConfigs';

const defaultPiniaState = {
  checklistTask: { checklistTasks: defaultChecklistTasks },
  station: { lineviewStation: { id: 1, zoneId: 'Asia/Kolkata' } },
  checklistTemplate: { shiftviewStationManualTemplates: [] },
  shift: { shift: getDefaultShift(), isShiftRunning: true },
  userPreferences: {
    viewSettings: {
      hideChecklists: false,
      visibleChecklistIdsByStation: {},
    },
  },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const profileStore = useProfileStore(pinia);
  profileStore.isReadOnly = overrides.profile?.isReadOnly ?? false;
  profileStore.shiftviewStationRoleAllows = overrides.profile?.shiftviewStationRoleAllows ?? (() => true);

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.screenWidth = overrides.device?.screenWidth ?? 1600;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.currentBatch = overrides.shiftviewTimeline?.currentBatch ?? {};

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(ChecklistOverviewDialog, {
  global: { plugins: [createPinia(overrides)] },
});

describe('ChecklistOverviewDialog', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in tablet', () => {
    const wrapper = createWrapper({ device: { showFullscreenDialogs: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ device: { isMobileView: true, showFullscreenDialogs: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that MISSED checks have red border', () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.MISSED, name: 'test missed', frequency: { productIds: [], commentIds: [] }, elements: [], dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('error');
  });

  test('that UNSUCCESSFUL checks have orange border', () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.UNSUCCESSFUL, name: 'test missed', frequency: { productIds: [], commentIds: [] }, elements: [], dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('secondary');
  });

  test('that SUCCESSFUL checks have green border', () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.SUCCESSFUL, name: 'test missed', frequency: { productIds: [], commentIds: [] }, elements: [], dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('primary');
  });

  test('that NEW checks have grey border', () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.NEW, name: 'test missed', frequency: { productIds: [], commentIds: [] }, elements: [], dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('lw-gray');
  });

  test('that due time is shown for a check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.NEW, name: 'test missed', frequency: { productIds: [], commentIds: [] }, elements: [], dateTimeISO: '2021-02-02T15:54:34.000Z',
        }],
      },
      station: { lineviewStation: { zoneId: 'UTC' } },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].dueString).toBe('15:54');
  });

  test('that frequency is shown for a check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.NEW,
          name: 'test missed',
          frequency: {
            type: 'CHANGEOVER', intervalTime: 60, productIds: [], commentIds: [],
          },
          elements: [],
          dateTimeISO: '2021-02-02T15:54:34.000Z',
        }],
      },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['{interval} after changeover', 'interval']);
  });

  test('that frequency is shown for a check with correct string value, if delay time is 0', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.NEW,
          name: 'test missed',
          frequency: {
            type: 'CHANGEOVER', delayTime: 0, intervalTime: 0, productIds: [], commentIds: [],
          },
          elements: [],
          dateTimeISO: '2021-02-02T15:54:34.000Z',
        }],
      },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['After changeover']);
  });

  test('that submission time is shown for a SUCCESSFUL check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.SUCCESSFUL,
          name: 'test missed',
          frequency: { type: 'CHANGEOVER', intervalTime: 60, productIds: [], commentIds: [] },
          elements: [{}, {}],
          dateTimeISO: '2021-02-02T15:54:34.000Z',
          submissionTimeISO: '2021-02-02T20:54:34.000Z',
        }],
      },
      station: { lineviewStation: { zoneId: 'UTC' } },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe('20:54');
  });

  test('that submission time is shown for a UNSUCCESSFUL check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.UNSUCCESSFUL,
          name: 'test missed',
          frequency: { type: 'CHANGEOVER', intervalTime: 60, productIds: [], commentIds: [] },
          elements: [{ successful: true, value: 12 }, { successful: false, value: null }],
          submissionTimeISO: '2021-02-02T20:54:34.000Z',
          dateTimeISO: '2021-02-02T15:54:34.000Z',
        }],
      },
      station: { lineviewStation: { zoneId: 'UTC' } },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe('20:54');
  });

  test('that submission time is not shown for a MISSED check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.MISSED,
          name: 'test missed',
          frequency: { type: 'CHANGEOVER', intervalTime: 60, productIds: [], commentIds: [] },
          elements: [{ value: null }, { value: null }, { value: null }],
          dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe(null);
  });

  test('that submission time is not shown for a NEW check', async () => {
    const wrapper = createWrapper({
      checklistTask: {
        checklistTasks: [{
          status: checklistStatuses.MISSED,
          name: 'test missed',
          frequency: { type: 'CHANGEOVER', intervalTime: 60, productIds: [], commentIds: [] },
          elements: [{ value: null }],
          dateTimeISO: '2020-01-01T12:42:00.000Z',
        }],
      },
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe(null);
  });

  it('renders correctly for read only user', async () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });
    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that when there is no checklists, then empty state is shown', () => {
    const wrapper = createWrapper({ checklistTask: { checklistTasks: [] } });

    expect(wrapper.find('#checklists-items-list').exists()).toBe(false);
    expect(wrapper.find('#empty-state').exists()).toBe(true);
  });

  test('that getCurrentProductManualChecklists does not return product-specific templates that do not have currently produced product', () => {
    const wrapper = createWrapper({
      shiftviewTimeline: { currentBatch: { id: 1, productId: 12 } },
      checklistTemplate: {
        shiftviewStationManualTemplates: [
          { id: 1, frequency: { productIds: [] } },
          { id: 2, frequency: { productIds: [1] } },
          { id: 3, frequency: { productIds: [12] } },
          { id: 4, frequency: { productIds: [1, 12] } },
        ],
      },
    });

    expect(wrapper.vm.getCurrentProductManualChecklists().map((template) => template.id)).toEqual([1, 3, 4]);
  });

  test('that onAddNewChecklist calls notifyWarning if there are no available manual templates', () => {
    const wrapper = createWrapper({ shiftviewTimeline: { currentBatch: { id: 1, productId: 12 } } });

    const notifyWarning = vi.spyOn(wrapper.vm, 'notifyWarning');
    wrapper.vm.onAddNewChecklist();

    expect(notifyWarning).toHaveBeenCalledTimes(1);
    expect(notifyWarning).toHaveBeenLastCalledWith({ text: 'No manual checklists available' });
  });

  test('that onAddNewChecklist calls openDialog if there are available manual templates', () => {
    const wrapper = createWrapper({
      shiftviewTimeline: { currentBatch: { id: 1, productId: 12 } },
      checklistTemplate: {
        shiftviewStationManualTemplates: [
          { id: 1, frequency: { productIds: [] } },
          { id: 2, frequency: { productIds: [1] } },
          { id: 3, frequency: { productIds: [12] } },
          { id: 4, frequency: { productIds: [1, 12] } },
        ],
      },
    });

    const openDialog = vi.spyOn(wrapper.vm, 'openDialog');
    wrapper.vm.onAddNewChecklist();

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(openDialog).toHaveBeenLastCalledWith({
      ...shiftviewDialogs.MANUAL_CHECKLIST,
      data: {
        templates: [
          { id: 1, frequency: { productIds: [] } },
          { id: 3, frequency: { productIds: [12] } },
          { id: 4, frequency: { productIds: [1, 12] } },
        ],
        time: expect.any(String),
      },
    });
  });

  it('has manual checklsit button in current shift', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('#add-manual-checklist').exists()).toBe(true);
  });

  it('does not have manual checklist button in current shift if user is readOnly', () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });

    expect(wrapper.find('#add-manual-checklist').exists()).toBe(false);
  });

  it('does not have manual checklist button in shif that ended more than 7 days ago', () => {
    const wrapper = createWrapper({
      shift: { shift: { id: 5, endTimeISO: DateTime.local().setZone('UTC').minus({ days: 10 }).toISO() } },
    });

    expect(wrapper.find('#add-manual-checklist').exists()).toBe(false);
  });

  it('shows all tab if there are no new checks', () => {
    const filteredChecklists = defaultChecklistTasks.filter((checklist) => checklist.status !== checklistStatuses.NEW);
    const wrapper = createWrapper({ checklistTask: { checklistTasks: filteredChecklists } });

    expect(wrapper.vm.tab).toBe(4);
  });

  test('filteredChecklists', () => {
    const wrapper = createWrapper();

    // new tab
    expect(wrapper.vm.filteredChecklists.length).toBe(1);
    expect(wrapper.vm.filteredChecklists[0].dueString).toBe('14:30');
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['Every {interval}']);
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe(null);
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('lw-gray');
    expect(wrapper.vm.filteredChecklists[0].commentsCount).toBe(0);

    // successful tab
    wrapper.vm.tab = 1;
    expect(wrapper.vm.filteredChecklists.length).toBe(1);
    expect(wrapper.vm.filteredChecklists[0].dueString).toBe('12:00');
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['Every {interval}']);
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe('14:36');
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('primary');
    expect(wrapper.vm.filteredChecklists[0].commentsCount).toBe(2);

    // unsuccessful tab
    wrapper.vm.tab = 2;
    expect(wrapper.vm.filteredChecklists.length).toBe(2);
    expect(wrapper.vm.filteredChecklists[0].dueString).toBe('13:25');
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['Every {interval}']);
    expect(wrapper.vm.filteredChecklists[0].doneString).toBe('14:36');
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('secondary');
    expect(wrapper.vm.filteredChecklists[0].commentsCount).toBe(0);

    // missed tab
    wrapper.vm.tab = 3;
    expect(wrapper.vm.filteredChecklists.length).toBe(4);
    expect(wrapper.vm.filteredChecklists[0].dueString).toBe('14:25');
    expect(wrapper.vm.filteredChecklists[0].frequencyString).toEqual(['Every {interval}']);
    expect(wrapper.vm.filteredChecklists[0].borderColor).toBe('error');
    expect(wrapper.vm.filteredChecklists[0].commentsCount).toBe(0);
  });

  test('that onDeleteChecklist calls openConfirmDialog with correct parameters', () => {
    const wrapper = createWrapper();

    const openConfirmDialogSpy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.onDeleteChecklist({ id: 1, name: 'test' });
    expect(openConfirmDialogSpy).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'Are you sure you want to delete this checklist?',
      action: expect.any(Function),
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  });

  describe('getSecondaryActionIcon', () => {
    it('returns empty string when shiftviewStationRoleAllows returns false', () => {
      const wrapper = createWrapper({ profile: { shiftviewStationRoleAllows: () => false } });

      expect(wrapper.vm.getSecondaryActionIcon({ status: checklistStatuses.SUCCESSFUL })).toBe('');
    });

    it('returns mdiDelete if check status is SUCCESSFUL and shiftviewStationRoleAllows returns true', () => {
      const wrapper = createWrapper({ profile: { shiftviewStationRoleAllows: () => true } });

      expect(wrapper.vm.getSecondaryActionIcon({ status: checklistStatuses.SUCCESSFUL })).toBe(mdiDelete);
    });

    it('returns mdiDelete if check status is UNSUCCESSFUL and shiftviewStationRoleAllows returns true', () => {
      const wrapper = createWrapper({ profile: { shiftviewStationRoleAllows: () => true } });

      expect(wrapper.vm.getSecondaryActionIcon({ status: checklistStatuses.UNSUCCESSFUL })).toBe(mdiDelete);
    });

    it('returns empty string if check status is NEW and shiftviewStationRoleAllows returns true', () => {
      const wrapper = createWrapper({ profile: { shiftviewStationRoleAllows: () => true } });

      expect(wrapper.vm.getSecondaryActionIcon({ status: checklistStatuses.NEW })).toBe('');
    });

    it('returns empty string if check status is MISSED and shiftviewStationRoleAllows returns true', () => {
      const wrapper = createWrapper({ profile: { shiftviewStationRoleAllows: () => true } });

      expect(wrapper.vm.getSecondaryActionIcon({ status: checklistStatuses.MISSED })).toBe('');
    });
  });

  test('getPrimaryActionIcon', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getPrimaryActionIcon({ status: checklistStatuses.NEW })).toBe('');
    expect(wrapper.vm.getPrimaryActionIcon({ status: checklistStatuses.SUCCESSFUL })).toBe(mdiPencil);
  });

  test('getPrimaryActionIcon for readOnly user', () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });

    expect(wrapper.vm.getPrimaryActionIcon({ status: checklistStatuses.NEW })).toBe(mdiChevronRight);
    expect(wrapper.vm.getPrimaryActionIcon({ status: checklistStatuses.SUCCESSFUL })).toBe(mdiChevronRight);
  });

  test('getPrimaryActionText', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.getPrimaryActionText({ status: checklistStatuses.NEW })).toBe('Start_verb');
    expect(wrapper.vm.getPrimaryActionText({ status: checklistStatuses.SUCCESSFUL })).toBe('');
  });

  test('getPrimaryActionText for readOnly user', () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });

    expect(wrapper.vm.getPrimaryActionText({ status: checklistStatuses.NEW })).toBe('');
    expect(wrapper.vm.getPrimaryActionText({ status: checklistStatuses.SUCCESSFUL })).toBe('');
  });

  test('isTabDisabled', () => {
    const wrapper = createWrapper({ profile: { isReadOnly: true } });

    expect(wrapper.vm.isTabDisabled({ count: 12 })).toBe(false);
    expect(wrapper.vm.isTabDisabled({ count: 0 })).toBe(true);
  });

  describe('checklist filter', () => {
    it('returns true for hasActiveFilters when station has specific visible checklists', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: {
            visibleChecklistIdsByStation: {
              [TEST_STATION_ID]: [TEST_CHECKLIST_ID_1],
            },
          },
        },
      });

      expect(wrapper.vm.hasActiveFilters).toBe(true);
    });

    it('hasActiveFilters returns false when station is not in map', () => {
      const wrapper = createWrapper({
        userPreferences: { viewSettings: { visibleChecklistIdsByStation: {} } },
      });

      expect(wrapper.vm.hasActiveFilters).toBe(false);
    });

    it('hasActiveFilters returns false when station has empty array (all selected)', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: { visibleChecklistIdsByStation: { [TEST_STATION_ID]: [] } },
        },
      });

      expect(wrapper.vm.hasActiveFilters).toBe(false);
    });

    it('visibleChecklistTasks shows only specified checklists', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: {
            visibleChecklistIdsByStation: {
              [TEST_STATION_ID]: [TEST_CHECKLIST_ID_1],
            },
          },
        },
      });

      const visibleIds = wrapper.vm.visibleChecklistTasks.map((t) => t.checklistId);
      const uniqueVisibleIds = [...new Set(visibleIds)];
      expect(uniqueVisibleIds).toEqual([TEST_CHECKLIST_ID_1]);
    });

    it('visibleChecklistTasks returns all checklists when station not in map', () => {
      const wrapper = createWrapper({
        userPreferences: { viewSettings: { visibleChecklistIdsByStation: {} } },
      });

      expect(wrapper.vm.visibleChecklistTasks.length).toBe(TEST_CHECKLIST_TASKS_COUNT);
    });

    it('visibleChecklistTasks returns all checklists when station has empty array', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: { visibleChecklistIdsByStation: { [TEST_STATION_ID]: [] } },
        },
      });

      expect(wrapper.vm.visibleChecklistTasks.length).toBe(TEST_CHECKLIST_TASKS_COUNT);
    });

    it('filteredChecklists only includes visible checklists', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: {
            visibleChecklistIdsByStation: {
              [TEST_STATION_ID]: [TEST_CHECKLIST_ID_1],
            },
          },
        },
      });

      wrapper.vm.tab = 4;
      const filteredIds = wrapper.vm.filteredChecklists.map((c) => c.checklistId);
      expect(filteredIds).toContain(TEST_CHECKLIST_ID_1);
      expect(filteredIds).not.toContain(TEST_CHECKLIST_ID_2);
    });

    it('statuses All tab count reflects filtered checklists', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: {
            visibleChecklistIdsByStation: {
              [TEST_STATION_ID]: [TEST_CHECKLIST_ID_1],
            },
          },
        },
      });

      const allTab = wrapper.vm.statuses.find((s) => s.id === 'ALL');
      expect(allTab.count).toBe(TEST_CHECKLIST_1_TASKS_COUNT);
    });

    it('mappedChecklistTasks counts statuses from filtered checklists only', () => {
      const wrapper = createWrapper({
        userPreferences: {
          viewSettings: {
            visibleChecklistIdsByStation: {
              [TEST_STATION_ID]: [TEST_CHECKLIST_ID_1],
            },
          },
        },
      });

      // TEST_CHECKLIST_ID_1 has 2 MISSED tasks in the test data
      const missedCount = wrapper.vm.mappedChecklistTasks.MISSED?.length || 0;
      expect(missedCount).toBe(2);
    });
  });
});
