import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiContentDuplicate, mdiDelete } from '@mdi/js';
import { cloneDeep } from 'lodash';
import { DateTime } from 'luxon';

vi.mock('luxon', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    DateTime: {
      ...original.DateTime,
      now: original.DateTime.now,
      fromJSDate: original.DateTime.fromJSDate, // Keep this original
      fromISO: original.DateTime.fromISO, // Keep this original
    },
  };
});

import SettingsChecklistEdit from './index.vue';

import { checkTypes, checklistTypes, periodicSubTypes, monthlyTriggerModes, monthlyTriggerOccurrences, allowedPropertiesByType } from '@/constants/checklistsConstants';
import { getDaysList } from '@/helpers/days/getDays';
import {
  useChecklistTemplateStore,
  useFactoryStore,
  useStationStore,
  useConfigurationStore,
} from '@/stores/index';

window.WorkerService = { process: () => Promise.resolve([]) };
document.body.setAttribute('data-app', true);

const defaultChecklistsTemplatesMap = {
  1: {
    id: 1,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'manual checklist',
    frequency: { type: checklistTypes.MANUAL },
    stationIds: [1],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
  2: {
    id: 2,
    active: true,
    description: 'test description',
    elements: [{ id: 1, name: 'test element', type: checkTypes.YES_NO }, {
      id: 2, name: 'test element 2', type: checkTypes.MEASUREMENT, minVal: 1, maxVal: 10, notApplicableEnabled: false, unit: 'kg', warningMessage: 'out of range',
    }],
    name: 'test',
    frequency: { type: checklistTypes.INTERVAL, intervalTime: 900 },
    stationIds: [1],
    manualAllowed: true,
    groupId: 1,
    authenticationRequired: true,
    startTime: '2024-01-01T12:00:00.000Z',
  },
  3: {
    id: 3,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'changeover checklist with interval',
    frequency: { type: checklistTypes.CHANGEOVER, intervalTime: 900 },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
  4: {
    id: 4,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'changeover checklist without interval',
    frequency: { type: checklistTypes.CHANGEOVER, intervalTime: 0, pauseDuringDowntime: true },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: true,
  },
  5: {
    id: 5,
    active: false,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'inactive quantity checklist',
    frequency: { type: checklistTypes.QUANTITY, targetQty: 5, resetOnChangeover: true },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
  6: {
    id: 6,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'active quantity checklist',
    frequency: { type: checklistTypes.QUANTITY, targetQty: 100, resetOnShiftStart: true },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: true,
  },
  7: {
    id: 7,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'stop reason checklist',
    frequency: { type: checklistTypes.STOPREASON, targetQty: 100, commentIds: [1, 2] },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
  8: {
    id: 8,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'daily checklist',
    frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY, times: ['12:00', '14:00'] },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: true,
  },
  9: {
    id: 9,
    active: false,
    description: 'test description',
    elements: [{ id: 1, name: 'test element', type: checkTypes.YES_NO }],
    name: 'test',
    frequency: { type: checklistTypes.INTERVAL, intervalTime: 900 },
    stationIds: [1],
    manualAllowed: true,
    groupId: 1,
    authenticationRequired: true,
    startTime: null,
  },
  10: {
    id: 10,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'Monthly on calendar day checklist',
    frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, times: ['12:00'], dayOfMonth: 15 },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
  11: {
    id: 11,
    active: true,
    description: '',
    elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
    name: 'Weekly checklist',
    frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.WEEKLY, times: ['12:00'], daysOfWeek: getDaysList().map((day) => day.value) },
    stationIds: [2],
    manualAllowed: false,
    groupId: 1,
    authenticationRequired: false,
  },
};

const defaultChecklistGroups = [
  { id: 1, name: 'group-1' },
  { id: 2, name: 'group-2' },
];

const defaultAdminStationsMap = {
  1: { id: 1, name: 'station-1', groupId: 1, factoryId: 1 },
  2: { id: 2, name: 'station-2', groupId: 1, factoryId: 1 },
  3: { id: 3, name: 'station-3', groupId: 1, factoryId: 2 },
};

const defaultGetterOverrides = {
  checklistTemplate: {
    isLoading: false,
    checklistsTemplatesMap: cloneDeep(defaultChecklistsTemplatesMap),
    checklistGroups: cloneDeep(defaultChecklistGroups),
  },
  station: {
    adminStationsMap: cloneDeep(defaultAdminStationsMap),
  },
  configuration: {
    adminChecklistStations: [1, 2, 3],
  },
};

const createPinia = (getterOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {},
  });

  const merged = cloneDeep(defaultGetterOverrides);
  Object.entries(getterOverrides).forEach(([storeName, overrides]) => {
    merged[storeName] = { ...merged[storeName], ...overrides };
  });

  Object.assign(useChecklistTemplateStore(pinia), merged.checklistTemplate);
  Object.assign(useStationStore(pinia), merged.station);
  Object.assign(useConfigurationStore(pinia), merged.configuration);

  // getFactoryIdsByStationIds is a parameterized getter - override as a function
  useFactoryStore(pinia).getFactoryIdsByStationIds = vi.fn(() => []);

  // Stub the action that is called from mounted()
  const checklistStore = useChecklistTemplateStore(pinia);
  vi.spyOn(checklistStore, 'fetchChecklists').mockResolvedValue([]);

  return pinia;
};

describe('SettingsChecklistEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  it('renders correctly when selected checklist is not in checklistsTemplatesMap', async () => {
    const pinia = createPinia({
      checklistTemplate: {
        checklistsTemplatesMap: {
          'test-56': {
            id: 'test-56',
            active: true,
            description: '',
            elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
            name: 'test checklist',
            frequency: { type: checklistTypes.MANUAL },
            stationIds: [1],
            manualAllowed: false,
            groupId: 1,
            authenticationRequired: false,
          },
        },
      },
    });
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { params: { id: 'test-55' } } },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new', async () => {
    const $route = { params: {} };
    const wrapper = mount(SettingsChecklistEdit, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: ['multi-line-switch', 'evocon-v-button', 'evocon-v-input', 'event-conditions-block', 'list-card', 'selection-input', 'v-textarea', 'icon-with-tooltip'],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  Object.values(defaultChecklistsTemplatesMap).forEach((template) => {
    it(`renders correctly when editing existing - ${template.name}`, async () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      const $route = { params: { id: template.id } };
      const wrapper = mount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
          stubs: [
            'multi-line-switch', 'evocon-v-button', 'evocon-v-input', 'event-conditions-block', 'list-card', 'selection-input', 'v-textarea', 'info-block', 'icon-with-tooltip', 'evocon-time-input',
          ],
        },
      });

      await flushPromises();
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('showResetWarning', () => {
    it('returns false if savedRequirements type is PERIODIC and subType is DAILY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: { id: 8 } } } },
        data: () => ({
          formData: { active: true },
        }),
      });

      expect(wrapper.vm.showResetWarning).toBe(false);
    });

    it('returns true if savedRequirements type is PERIODIC and subType is WEEKLY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: { id: 11 } } } },
        data: () => ({
          formData: { active: true },
        }),
      });

      expect(wrapper.vm.showResetWarning).toBe(true);
    });

    it('returns true if savedRequirements type is PERIODIC and subType is MONTHLY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: { id: 10 } } } },
        data: () => ({
          formData: { active: true },
        }),
      });

      expect(wrapper.vm.showResetWarning).toBe(true);
    });
  });

  describe('isWeeklyChecklist', () => {
    it('returns false if type is not PERIODIC', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.MANUAL } },
        }),
      });

      expect(wrapper.vm.isWeeklyChecklist).toBe(false);
    });

    it('returns false if type is PERIODIC but subType is DAILY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY } },
        }),
      });

      expect(wrapper.vm.isWeeklyChecklist).toBe(false);
    });

    it('returns true if type is PERIODIC and subType is WEEKLY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.WEEKLY } },
        }),
      });

      expect(wrapper.vm.isWeeklyChecklist).toBe(true);
    });
  });

  describe('isMonthlyChecklist', () => {
    it('returns false if type is not PERIODIC', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.MANUAL } },
        }),
      });

      expect(wrapper.vm.isMonthlyChecklist).toBe(false);
    });

    it('returns false if type is PERIODIC but subType is DAILY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY } },
        }),
      });

      expect(wrapper.vm.isMonthlyChecklist).toBe(false);
    });

    it('returns true if type is PERIODIC and subType is MONTHLY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route: { params: {} } } },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY } },
        }),
      });

      expect(wrapper.vm.isMonthlyChecklist).toBe(true);
    });
  });

  describe('setFormData', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z')); // setting timezone is important here
    });
    it('leaves formData empty when adding new checklist', async () => {
      const $route = { params: {} };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: undefined,
        name: '',
        description: '',
        elements: [],
        frequency: {
          type: '',
          intervalTime: null,
          delayTime: 0,
          leadTime: 0,
          pauseDuringDowntime: false,
          productIds: [],
          resetOnShiftStart: false,
          resetOnChangeover: false,
          daysOfWeek: [],
          times: [''],
          targetQty: null,
          commentIds: [],
          positionIds: [],
          setpoint: null,
          offsetFromStartSeconds: null,
          offsetFromEndSeconds: null,
        },
        stationIds: [],
        manualAllowed: false,
        groupId: null,
        authenticationRequired: false,
        active: false,
        startTime: null,
      });
    });

    it('sets correct formData when editing existing active INTERVAL checklist with startTime in the future', async () => {
      vi.setSystemTime(new Date('2024-01-01T11:00:00.000Z'));
      const $route = { params: { id: 2 } };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: 2,
        active: true,
        description: 'test description',
        elements: [{ id: 1, name: 'test element', type: checkTypes.YES_NO }, {
          id: 2, name: 'test element 2', type: checkTypes.MEASUREMENT, minVal: 1, maxVal: 10, notApplicableEnabled: false, unit: 'kg', warningMessage: 'out of range',
        }],
        name: 'test',
        frequency: { type: checklistTypes.INTERVAL, intervalTime: 900 },
        stationIds: [1],
        manualAllowed: true,
        groupId: 1,
        authenticationRequired: true,
        startTime: '2024-01-01T12:00:00.000Z',
      });
    });

    it('sets correct formData when editing existing inactive INTERVAL checklist', async () => {
      const $route = { params: { id: 9 } };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: 9,
        active: false,
        description: 'test description',
        elements: [{ id: 1, name: 'test element', type: checkTypes.YES_NO }],
        name: 'test',
        frequency: { type: checklistTypes.INTERVAL, intervalTime: 900 },
        stationIds: [1],
        manualAllowed: true,
        groupId: 1,
        authenticationRequired: true,
        startTime: null,
      });
    });

    it('sets correct formData when editing existing active INTERVAL checklist with startTime in the past', async () => {
      vi.setSystemTime(new Date('2024-01-01T14:00:00.000Z'));
      const $route = { params: { id: 2 } };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: 2,
        active: true,
        description: 'test description',
        elements: [{ id: 1, name: 'test element', type: checkTypes.YES_NO }, {
          id: 2, name: 'test element 2', type: checkTypes.MEASUREMENT, minVal: 1, maxVal: 10, notApplicableEnabled: false, unit: 'kg', warningMessage: 'out of range',
        }],
        name: 'test',
        frequency: { type: checklistTypes.INTERVAL, intervalTime: 900 },
        stationIds: [1],
        manualAllowed: true,
        groupId: 1,
        authenticationRequired: true,
        startTime: null,
      });
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    it('sets correct formData when editing existing MANUAL checklist', async () => {
      const $route = { params: { id: 1 } };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: 1,
        active: true,
        description: '',
        elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
        name: 'manual checklist',
        frequency: { type: checklistTypes.MANUAL },
        stationIds: [1],
        manualAllowed: false,
        groupId: 1,
        authenticationRequired: false,
        startTime: null,
      });
    });

    it('sets currentMonthlyTriggerMode to ON_CALENDAR_DAY when editing existing monthly checklist with dayOfMonth set', async () => {
      const $route = { params: { id: 10 } };
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      await flushPromises();

      expect(wrapper.vm.formData).toEqual({
        id: 10,
        active: true,
        description: '',
        elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
        name: 'Monthly on calendar day checklist',
        frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, times: ['12:00'], dayOfMonth: 15 },
        stationIds: [2],
        manualAllowed: false,
        groupId: 1,
        authenticationRequired: false,
        startTime: null,
      });
      expect(wrapper.vm.currentMonthlyTriggerMode).toBe(monthlyTriggerModes.ON_CALENDAR_DAY);
    });
  });

  it('calls promptSavingChanges in beforeRouteLeave if haveChecklistElementsChanged is true', async () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
      data: () => ({
        haveChecklistElementsChanged: true,
      }),
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const spy = vi.spyOn(wrapper.vm, 'promptSavingChanges');
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());

    expect(spy).toBeCalledTimes(1);
  });

  it('calls next in beforeRouteLeave if haveChecklistElementsChanged is true', async () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const nextFun = vi.fn();

    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', nextFun);

    expect(nextFun).toBeCalledTimes(1);
  });

  test('that promptSavingChanges calls openConfirmDialog', async () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.promptSavingChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('getStationIds', async () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    await wrapper.setData({ formData: { stationIds: [1, 2] } });
    expect(wrapper.vm.getStationIds()).toEqual([1, 2]);

    await wrapper.setData({ formData: { stationIds: [] }, factoryIds: [] });
    expect(wrapper.vm.getStationIds()).toEqual([1, 2, 3]);

    await wrapper.setData({ formData: { stationIds: [] }, factoryIds: [1] });
    expect(wrapper.vm.getStationIds()).toEqual([1, 2]);
  });

  test('that checklistTaskCardButtons array has delete, duplicate and edit actions', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    expect(wrapper.vm.checklistTaskCardButtons.length).toBe(3);
    expect(wrapper.vm.checklistTaskCardButtons[0]).toEqual({
      icon: mdiPencil,
      text: 'Edit',
      tooltip: 'Edit',
      action: expect.any(Function),
    });
    expect(wrapper.vm.checklistTaskCardButtons[1]).toEqual({
      icon: mdiContentDuplicate,
      text: 'Duplicate',
      tooltip: 'Duplicate',
      action: expect.any(Function),
    });
    expect(wrapper.vm.checklistTaskCardButtons[2]).toEqual({
      icon: mdiDelete,
      text: 'Delete',
      tooltip: 'Delete',
      action: expect.any(Function),
    });
  });

  describe('getSubtitle', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    it('returns correct subtitle for YES_NO task', async () => {
      expect(wrapper.vm.getSubtitle({ type: checkTypes.YES_NO })).toEqual('Yes/No');
    });

    it('returns correct subtitle for MEASUREMENT task', async () => {
      expect(wrapper.vm.getSubtitle({ type: checkTypes.MEASUREMENT })).toEqual('Measurement');
    });

    it('returns correct subtitle for TEXT task', async () => {
      expect(wrapper.vm.getSubtitle({ type: checkTypes.TEXT })).toEqual('Enter text');
    });

    it('returns correct subtitle for SELECTION task', async () => {
      expect(wrapper.vm.getSubtitle({ type: checkTypes.SELECTION })).toEqual('Select');
    });

    it('returns correct subtitle for CHECK task', async () => {
      expect(wrapper.vm.getSubtitle({ type: checkTypes.CHECK })).toEqual('Mark as done');
    });

    it('returns empty string for other type', async () => {
      expect(wrapper.vm.getSubtitle({ type: 'OTHER' })).toEqual('');
    });
  });

  describe('onItemDelete', () => {
    const $route = { params: {} };
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(SettingsChecklistEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
        data: () => ({
          formData: {
            elements: [
              { id: 1, name: 'element 1', type: checkTypes.YES_NO },
              { id: 2, name: 'element 2', type: checkTypes.MEASUREMENT },
            ],
          },
          haveChecklistElementsChanged: false,
        }),
      });
    });

    it('removes the element at the specified index', async () => {
      wrapper.vm.onItemDelete({ index: 0 });
      expect(wrapper.vm.formData.elements).toEqual([
        { id: 2, name: 'element 2', type: checkTypes.MEASUREMENT },
      ]);
    });

    it('sets haveChecklistElementsChanged to true', async () => {
      wrapper.vm.onItemDelete({ index: 0 });
      expect(wrapper.vm.haveChecklistElementsChanged).toBe(true);
    });

    it('does not throw an error if index is out of bounds', async () => {
      expect(() => wrapper.vm.onItemDelete({ index: 5 })).not.toThrow();
      expect(wrapper.vm.formData.elements.length).toBe(2);
    });
  });

  describe('isRemovedChecklist', () => {
    it('returns false if checklistId is missing from params', async () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedChecklist).toBe(false);
    });

    it('returns false if selected checklist is in checklistsTemplatesMap', async () => {
      const pinia = createPinia({
        checklistTemplate: {
          checklistsTemplatesMap: {
            'test-34': {
              id: 'test-34',
              active: true,
              description: '',
              deleted: false,
              elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
              name: 'test checklist',
              frequency: { type: checklistTypes.MANUAL },
              stationIds: [1],
              manualAllowed: false,
              groupId: 1,
              authenticationRequired: false,
            },
          },
        },
      });
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [pinia],
          mocks: { $route: { params: { id: 'test-34' } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedChecklist).toBe(false);
    });

    it('returns true if selected checklist is in checklistsTemplatesMap but marked as deleted', async () => {
      const pinia = createPinia({
        checklistTemplate: {
          checklistsTemplatesMap: {
            'test-34': {
              id: 'test-34',
              active: false,
              description: '',
              deleted: true,
              elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
              name: 'removed checklist',
              frequency: { type: checklistTypes.MANUAL },
              stationIds: [1],
              manualAllowed: false,
              groupId: 1,
              authenticationRequired: false,
            },
          },
        },
      });
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [pinia],
          mocks: { $route: { params: { id: 'test-34' } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedChecklist).toBe(true);
    });

    it('returns true if selected checklist is not in checklistsTemplatesMap', async () => {
      const pinia = createPinia({
        checklistTemplate: {
          checklistsTemplatesMap: {
            'test-34': {
              id: 'test-34',
              active: false,
              description: '',
              elements: [{ id: 1, name: 'element 1', type: checkTypes.YES_NO }],
              name: 'removed checklist',
              frequency: { type: checklistTypes.MANUAL },
              stationIds: [1],
              manualAllowed: false,
              groupId: 1,
              authenticationRequired: false,
            },
          },
        },
      });
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [pinia],
          mocks: { $route: { params: { id: 'test-35' } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedChecklist).toBe(true);
    });
  });

  test('that beforeRouteEnter sets itemGroupId from params if it exists', async () => {
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { params: {} } },
      },
    });
    expect(wrapper.vm.groupId).toBeUndefined();
    await wrapper.vm.$options.beforeRouteEnter.call(wrapper.vm, { query: { itemGroupId: 2 }, params: {} }, null, (cb) => cb(wrapper.vm));
    expect(wrapper.vm.formData.groupId).toBe(2);
  });

  test('that cleanAndSaveChecklist fills empty WEEKLY trigger daysOfWeek array with all days if it is empty', async () => {
    const wrapper = shallowMount(SettingsChecklistEdit, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { params: {} }, $router: { push: vi.fn() } },
      },
      data: () => ({
        formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.WEEKLY, times: ['12:00'], daysOfWeek: [] } },
      }),
    });

    expect(wrapper.vm.formData.frequency.daysOfWeek).toEqual([]);
    await wrapper.vm.cleanAndSaveChecklist();
    expect(wrapper.vm.formData.frequency.daysOfWeek).toEqual(getDaysList().map((day) => day.id));
  });

  describe('onUpdateFrequency', () => {
    it('updates factoryIds if changes includes factoryIds', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
      });

      expect(wrapper.vm.factoryIds).toEqual([]);
      wrapper.vm.onUpdateFrequency({ factoryIds: [1, 2] });
      expect(wrapper.vm.factoryIds).toEqual([1, 2]);
    });

    it('updates currentMonthlyTriggerMode if changes includes currentMonthlyTriggerMode', async () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
      });

      expect(wrapper.vm.currentMonthlyTriggerMode).toBe(monthlyTriggerModes.ON_WEEKDAY);
      wrapper.vm.onUpdateFrequency({ currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY });
      expect(wrapper.vm.currentMonthlyTriggerMode).toBe(monthlyTriggerModes.ON_CALENDAR_DAY);
    });

    it('updates manualAllowed and stationIds if changes includes these', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
      });

      expect(wrapper.vm.formData.manualAllowed).toBe(false);
      expect(wrapper.vm.formData.stationIds).toEqual([]);
      wrapper.vm.onUpdateFrequency({ manualAllowed: true, stationIds: [1, 2] });
      expect(wrapper.vm.formData.manualAllowed).toBe(true);
      expect(wrapper.vm.formData.stationIds).toEqual([1, 2]);
    });

    it('updates formData.frequency with changes', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: { frequency: { type: '', subType: '', times: [''], daysOfWeek: [] } },
        }),
      });

      wrapper.vm.onUpdateFrequency({ type: checklistTypes.PERIODIC, subType: checklistTypes.WEEKLY, times: ['12:00', '14:00'], daysOfWeek: ['MONDAY', 'WEDNESDAY'] });
      expect(wrapper.vm.formData.frequency).toEqual({ type: checklistTypes.PERIODIC, subType: checklistTypes.WEEKLY, times: ['12:00', '14:00'], daysOfWeek: ['MONDAY', 'WEDNESDAY'] });
    });
  });

  describe('getAllowedProperties', () => {
    it('returns correct allowed properties if frequency type is MANUAL', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: { frequency: { type: checklistTypes.MANUAL } },
        }),
      });

      expect(wrapper.vm.getAllowedProperties()).toEqual(allowedPropertiesByType[checklistTypes.MANUAL]);
    });

    it('returns correct allowed properties if frequency type is PERIODIC and subType is DAILY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY } },
        }),
      });

      expect(wrapper.vm.getAllowedProperties()).toEqual(allowedPropertiesByType[checklistTypes.PERIODIC][periodicSubTypes.DAILY]);
    });

    it('returns correct allowed properties if frequency type is PERIODIC and subType is WEEKLY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: { frequency: { type: checklistTypes.PERIODIC, subType: periodicSubTypes.WEEKLY } },
        }),
      });

      expect(wrapper.vm.getAllowedProperties()).toEqual(allowedPropertiesByType[checklistTypes.PERIODIC][periodicSubTypes.WEEKLY]);
    });

    it('returns correct allowed properties if frequency type is PERIODIC, subType is MONTHLY and currentMonthlyTriggerMode is ON_CALENDAR_DAY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
          formData: {
            frequency: {
              type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, times: ['12:00'], occurrence: monthlyTriggerOccurrences.SECOND, dayOfWeek: 'TUESDAY', dayOfMonth: 15,
            },
          },
        }),
      });

      expect(wrapper.vm.getAllowedProperties()).toEqual(allowedPropertiesByType[checklistTypes.PERIODIC][periodicSubTypes.MONTHLY][monthlyTriggerModes.ON_CALENDAR_DAY]);
    });

    it('returns correct allowed properties if frequency type is PERIODIC, subType is MONTHLY and currentMonthlyTriggerMode is ON_WEEKDAY', () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
          formData: {
            frequency: {
              type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, times: ['12:00'], occurrence: monthlyTriggerOccurrences.SECOND, dayOfWeek: 'TUESDAY', dayOfMonth: 15,
            },
          },
        }),
      });

      expect(wrapper.vm.getAllowedProperties()).toEqual(allowedPropertiesByType[checklistTypes.PERIODIC][periodicSubTypes.MONTHLY][monthlyTriggerModes.ON_WEEKDAY]);
    });
  });

  describe('removeRedundantFrequencyProperties', () => {
    it('sets startTime to null if frequency type is not INTERVAL', async () => {
      const wrapper = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: {
            frequency: { type: checklistTypes.MANUAL },
            startTime: '2024-01-01T12:00:00.000Z',
          },
        }),
      });

      expect(wrapper.vm.formData.startTime).toBe('2024-01-01T12:00:00.000Z');
      wrapper.vm.removeRedundantFrequencyProperties();
      expect(wrapper.vm.formData.startTime).toBeNull();
    });
  });

  describe('startClock watcher', () => {
    let mockNow;
    let component;

    beforeEach(() => {
      // Reset mock and component before each test
      component = shallowMount(SettingsChecklistEdit, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { params: {} } },
        },
        data: () => ({
          formData: {
            frequency: { type: checklistTypes.INTERVAL },
            startTime: '2024-01-01T12:00:00.000Z',
          },
        }),
      });
      mockNow = vi.spyOn(DateTime, 'now');
    });
    it('sets startTime to null if startClock is set to null', async () => {
      expect(component.vm.formData.startTime).toBe('2024-01-01T12:00:00.000Z');
      component.vm.$options.watch.startClock.call(component.vm, null);
      expect(component.vm.formData.startTime).toBeNull();
    });

    it('sets correct startTime based on  startClock', async () => {
      const mockDate = new Date('2024-01-01T12:00:00.000Z');
      mockNow.mockReturnValue(DateTime.fromJSDate(mockDate).setZone('UTC'));
      expect(component.vm.formData.startTime).toBe('2024-01-01T12:00:00.000Z');
      component.vm.$options.watch.startClock.call(component.vm, '17:00');
      const expectedTime = new Date('2024-01-01T17:00:00.000Z');
      expect(component.vm.formData.startTime).toBe(DateTime.fromJSDate(expectedTime).setZone('UTC').toISO());
    });
  });
});
