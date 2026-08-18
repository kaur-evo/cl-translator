import { shallowMount, flushPromises } from '@vue/test-utils';
import * as router from 'vue-router';
import { nextTick } from 'vue';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import SettingsShiftsEdit from './index.vue';

import { useStationStore, useDeviceStore, useProfileStore, useFactoryStore, useConfirmDialogStore } from '@/stores/index';
import predefinedStopsApi from '@/api/predefinedStopsApi';
import { timeFormats } from '@/constants/formattingConstants';
// eslint-disable-next-line import/order
import shiftApi from '@/api/shiftApi';

vi.mock('@/api/predefinedStopsApi');
vi.mock('@/api/shiftApi');

const defaultStations = [
  { id: 1, factoryId: 1, groupId: 1 },
  { id: 2, factoryId: 1, groupId: 1 },
  { id: 3, factoryId: 1, groupId: 1 },
  { id: 4, factoryId: 2, groupId: 2 },
];

const makeGetSelectedFactoryAllowedStations = (stations = defaultStations) => (factoryIds = [], stationIds = [], key = null) => {
  if (!factoryIds.length) return [];
  return stations.reduce((acc, station) => {
    const allStationsSelected = () => stationIds.length === 0;
    const isFactorySelected = () => factoryIds.includes(station.factoryId);
    const isStationSelected = () => stationIds.includes(station.id);
    const matchesStation = () => allStationsSelected() || isStationSelected();
    if (isFactorySelected() && matchesStation()) {
      acc.push(key ? station[key] : station);
    }
    return acc;
  }, []);
};

let mockStationStore;
let mockDeviceStore;
let mockProfileStore;
let mockFactoryStore;
let mockConfirmDialogStore;

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
}));
const validateAutoCommentTimes = vi.fn();
const mockOpenEditNoShiftDialog = vi.fn();
const mockOpenDeleteNoShiftConfirmation = vi.fn();
const mockLoadNoShiftDeviations = vi.fn();
const mockOpenDeleteTimeDeviationConfirmation = vi.fn();
const mockLoadTimeDeviations = vi.fn();

vi.mock('@/components/pages/settings/SettingsShiftsEdit/usePredefinedStops.js', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    predefinedStops: [],
    isLoading: false,
    fetchPredefinedStops: vi.fn(),
    autoStopsWithErrors: { value: [] },
    hasUnsavedPredefinedStops: false,
    validateAutoCommentTimes,
    getTimeRangeLabelValue: vi.fn(),
  })),
}));

vi.mock('@/components/pages/settings/SettingsShiftsEdit/useNoShiftDeviations.js', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    openEditNoShiftDialog: mockOpenEditNoShiftDialog,
    openDeleteNoShiftConfirmation: mockOpenDeleteNoShiftConfirmation,
    noShiftDeviationsLoading: { value: false },
    currentNoShiftDeviations: { value: [] },
    loadNoShiftDeviations: mockLoadNoShiftDeviations,
  })),
}));

vi.mock('@/components/pages/settings/SettingsShiftsEdit/useTimeDeviations.js', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    timeDeviationsLoading: { value: false },
    currentTimeDeviations: { value: [] },
    loadTimeDeviations: mockLoadTimeDeviations,
    openDeleteTimeDeviationConfirmation: mockOpenDeleteTimeDeviationConfirmation,
  })),
}));
const postPredefinedStops = vi.fn().mockResolvedValue([{ id: 1 }]);
predefinedStopsApi.getPredefinedStops = () => [];
predefinedStopsApi.postPredefinedStops = postPredefinedStops;
shiftApi.saveShiftTemplate = vi.fn();

const $route = { params: {} };

// Mutable shiftTemplate state for mock store - tests override these before mounting
const defaultShiftTemplatesMap = {
  2: {
    id: 2, name: 'template 2', stationIds: [1], startTime: '12:00', endTime: '17:00', factoryIds: [1], daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
  },
};
import useShiftTemplateStore from '@/stores/shiftTemplate';

let mockShiftTemplateStore;

describe('SettingsShiftsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    setActivePinia(pinia);

    mockShiftTemplateStore = useShiftTemplateStore();
    mockShiftTemplateStore.shiftTemplatesMap = defaultShiftTemplatesMap;
    mockShiftTemplateStore.isLoading = false;
    mockShiftTemplateStore.shiftTemplates = [];
    mockShiftTemplateStore.fetchShiftTemplates = vi.fn();
    mockShiftTemplateStore.saveShiftTemplate = vi.fn();
    mockShiftTemplateStore.deleteShiftTemplate = vi.fn();

    mockStationStore = useStationStore();
    mockStationStore.getSelectedFactoryAllowedStations = makeGetSelectedFactoryAllowedStations();
    mockStationStore.stationGroups = [{ id: 1 }, { id: 2 }];

    mockDeviceStore = useDeviceStore();
    mockDeviceStore.isMobileView = false;

    mockProfileStore = useProfileStore();
    mockProfileStore.language = 'en';
    mockProfileStore.firstDayOfWeek = 1;
    mockProfileStore.currentUser = { timeFormat: timeFormats['24H'] };

    mockFactoryStore = useFactoryStore();
    mockFactoryStore.orderedWriteAccessFactories = [{ id: 1, name: 'factory 1' }, { id: 2, name: 'factory 2' }];
    mockFactoryStore.hasMultipleAdminFactories = true;
    mockFactoryStore.getFactoryIdsByStationIds = () => [1];

    mockConfirmDialogStore = useConfirmDialogStore();
    mockConfirmDialogStore.openConfirmDialog = vi.fn();
  });

  it('renders correctly when selected shift template is not in shiftTemplatesMap', async () => {
    mockShiftTemplateStore.shiftTemplatesMap = {
      2: {
        id: 2, name: 'template 2', stationIds: [1], startTime: '12:00', endTime: '17:00', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
      },
    };
    vi.mocked(router).useRoute.mockReturnValue({ params: { id: 3 } });
    const wrapper = shallowMount(SettingsShiftsEdit, {
      global: {
        stubs: { 'form-page-template': false },
      },
    });

    wrapper.vm.$vuetify.display.smAndUp = true;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - adding new', async () => {
    vi.mocked(router).useRoute.mockReturnValue({ params: {} });
    const wrapper = shallowMount(SettingsShiftsEdit, {
      global: {
        stubs: { 'form-page-template': false },
      },
    });
    wrapper.vm.$vuetify.display.smAndUp = true;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - editing existing', async () => {
    vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
    const wrapper = shallowMount(SettingsShiftsEdit, {
      global: {
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    wrapper.vm.factoryId = 1;
    wrapper.vm.$vuetify.display.smAndUp = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - user has just one factory', async () => {
    mockFactoryStore.hasMultipleAdminFactories = false;
    mockFactoryStore.orderedWriteAccessFactories = [{ id: 1, name: 'factory 1' }];
    const wrapper = shallowMount(SettingsShiftsEdit, {
      global: {
        stubs: { 'form-page-template': false },
      },
    });
    wrapper.vm.factoryId = 1;
    wrapper.vm.$vuetify.display.smAndUp = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if screen is not smAndUp', async () => {
    const wrapper = shallowMount(SettingsShiftsEdit, {
      global: {
        stubs: { 'form-page-template': false },
      },
    });
    wrapper.vm.$vuetify.display.smAndUp = false;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('sets formData when editing existing', async () => {
    vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
    const testTemplate = {
      id: 2,
      name: 'template 2',
      stationIds: [1],
      startTime: '12:00', endTime: '17:00',
      daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
      color: '',
      dateConfig: {},
      enabled: true,
    };
    mockShiftTemplateStore.shiftTemplatesMap = { 2: testTemplate };
    const wrapper = shallowMount(SettingsShiftsEdit);

    await flushPromises();

    expect(wrapper.vm.formData).toEqual(testTemplate);
  });

  it('sets factoryId when editing existing', async () => {
    vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
    mockFactoryStore.getFactoryIdsByStationIds = () => [2];
    const testTemplate = {
      id: 2, name: 'template 2', stationIds: [1], startTime: '12:00', endTime: '17:00', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
    };
    mockShiftTemplateStore.shiftTemplatesMap = { 2: testTemplate };
    const wrapper = shallowMount(SettingsShiftsEdit);

    await flushPromises();

    expect(wrapper.vm.factoryId).toEqual(2);
  });

  it('sets factoryId when adding new and user has just one factory', async () => {
    mockFactoryStore.hasMultipleAdminFactories = false;
    mockFactoryStore.orderedWriteAccessFactories = [{ id: 1, name: 'factory 1' }];
    const wrapper = shallowMount(SettingsShiftsEdit);

    await flushPromises();

    expect(wrapper.vm.factoryId).toEqual(1);
  });

  test('that promptSavingChanges calls openConfirmDialog', async () => {
    const wrapper = shallowMount(SettingsShiftsEdit);

    wrapper.vm.promptSavingChanges();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockConfirmDialogStore.openConfirmDialog).toHaveBeenCalled();
    expect(mockConfirmDialogStore.openConfirmDialog).toHaveBeenCalledWith(expect.any(Object));
  });

  test('onSave', async () => {
    const wrapper = shallowMount(SettingsShiftsEdit);
    wrapper.vm.validateAutoCommentTimes = vi.fn();
    await flushPromises();
    await nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.onSave();
    expect(mockShiftTemplateStore.saveShiftTemplate).toHaveBeenCalled();
    expect(mockShiftTemplateStore.saveShiftTemplate).toHaveBeenCalledWith({ data: wrapper.vm.formData, callback: expect.any(Function) });
    expect(validateAutoCommentTimes).toHaveBeenCalledTimes(1);
  });

  describe('save btn', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockShiftTemplateStore.shiftTemplatesMap = defaultShiftTemplatesMap;
      mockShiftTemplateStore.isLoading = false;
      mockShiftTemplateStore.fetchShiftTemplates = vi.fn();
      mockShiftTemplateStore.saveShiftTemplate = vi.fn();
      mockShiftTemplateStore.deleteShiftTemplate = vi.fn();
    });

    it('is disabled when name is missing from formData', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.name = '';
      wrapper.vm.formData.stationIds = [5];
      wrapper.vm.formData.startTime = '10:00';
      wrapper.vm.formData.endTime = '12:00';
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];

      expect(wrapper.vm.saveBtnDisabled).toBe(true);
    });

    it('is disabled when stationIds is empty from formData', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.name = 'shift template';
      wrapper.vm.formData.stationIds = [];
      wrapper.vm.formData.startTime = '10:00';
      wrapper.vm.formData.endTime = '12:00';
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];

      expect(wrapper.vm.saveBtnDisabled).toBe(true);
    });

    it('is disabled when startTime is missing from formData', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.name = 'shift template';
      wrapper.vm.formData.stationIds = [5];
      wrapper.vm.formData.startTime = null;
      wrapper.vm.formData.endTime = '12:00';
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];

      expect(wrapper.vm.saveBtnDisabled).toBe(true);
    });

    it('is disabled when endTime is missing from formData', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.name = 'shift template';
      wrapper.vm.formData.stationIds = [5];
      wrapper.vm.formData.startTime = '10:00';
      wrapper.vm.formData.endTime = null;
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];

      expect(wrapper.vm.saveBtnDisabled).toBe(true);
    });

    it('is disabled when formData daysOfWeek is empty', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.name = 'shift template';
      wrapper.vm.formData.stationIds = [5];
      wrapper.vm.formData.startTime = '10:00';
      wrapper.vm.formData.endTime = '12:00';
      wrapper.vm.formData.daysOfWeek = [];

      expect(wrapper.vm.saveBtnDisabled).toBe(true);
    });

    it('is not disabled when all formData fields are set', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);
      wrapper.vm.formData.name = 'shift template';
      wrapper.vm.formData.stationIds = [5];
      wrapper.vm.formData.startTime = '10:00';
      wrapper.vm.formData.endTime = '12:00';
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];

      expect(wrapper.vm.saveBtnDisabled).toBe(false);
    });
  });

  describe('filteredStations', () => {
    it('returns all stations when user has just one factory', async () => {
      const stations = [{ id: 1, factoryId: 1 }, { id: 2, factoryId: 1 }, { id: 3, factoryId: 1 }, { id: 4, factoryId: 2 }];
      mockFactoryStore.hasMultipleAdminFactories = false;
      mockFactoryStore.orderedWriteAccessFactories = [{ id: 1, name: 'factory 1' }];
      mockStationStore.getSelectedFactoryAllowedStations = makeGetSelectedFactoryAllowedStations(stations);
      const wrapper = shallowMount(SettingsShiftsEdit);
      wrapper.vm.factoryId = 1;
      await nextTick();

      expect(wrapper.vm.selectedFactoryAllowedStations).toEqual(stations.filter((s) => s.factoryId === 1));
    });

    it('returns empty array if user has multiple factories and no factory is selected', () => {
      const stations = [{ id: 1, factoryId: 1 }, { id: 2, factoryId: 1 }, { id: 3, factoryId: 1 }, { id: 4, factoryId: 2 }];
      mockStationStore.getSelectedFactoryAllowedStations = makeGetSelectedFactoryAllowedStations(stations);
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.factoryId = null;

      expect(wrapper.vm.selectedFactoryAllowedStations).toEqual([]);
    });

    it('returns filtered stations when user has multiple factories and a factory is selected', () => {
      const stations = [{ id: 1, factoryId: 1 }, { id: 2, factoryId: 1 }, { id: 3, factoryId: 1 }, { id: 4, factoryId: 2 }];
      mockStationStore.getSelectedFactoryAllowedStations = makeGetSelectedFactoryAllowedStations(stations);
      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.factoryId = 2;

      expect(wrapper.vm.selectedFactoryAllowedStations).toEqual([{ id: 4, factoryId: 2 }]);
    });
  });

  describe('onToggleAllDays', () => {
    it('selects all days if none is selected before', () => {
      const wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: { $route },
        },
      });

      wrapper.vm.formData.daysOfWeek = [];
      wrapper.vm.onToggleAllDays();
      expect(wrapper.vm.formData.daysOfWeek).toEqual(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
    });

    it('selects all days if some are selected before', () => {
      const wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: { $route },
        },
      });

      wrapper.vm.formData.daysOfWeek = ['WEDNESDAY', 'FRIDAY'];
      wrapper.vm.onToggleAllDays();
      expect(wrapper.vm.formData.daysOfWeek).toEqual(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
    });

    it('deselects all days if all are selected before', () => {
      const wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: { $route },
        },
      });

      wrapper.vm.formData.daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      wrapper.vm.onToggleAllDays();
      expect(wrapper.vm.formData.daysOfWeek).toEqual([]);
    });
  });

  describe('isRemovedShiftTemplate', () => {
    it('returns false if isLoading is true', () => {
      mockShiftTemplateStore.isLoading = true;
      const wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isRemovedShiftTemplate).toBe(false);
    });

    it('returns false if shiftId does not exist', () => {
      const wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: { $route: { params: {} } },
        },
      });

      expect(wrapper.vm.isRemovedShiftTemplate).toBe(false);
    });

    it('returns false if shiftId exists, shift is in shiftTemplatesMap and not marked as deleted', () => {
      mockShiftTemplateStore.shiftTemplatesMap = {
        2: {
          id: 2, name: 'template 2', stationIds: [1], startTime: '12:00', endTime: '17:00', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'], deleted: false,
        },
      };
      vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
      const wrapper = shallowMount(SettingsShiftsEdit);

      expect(wrapper.vm.isRemovedShiftTemplate).toBe(false);
    });

    it('returns true if shiftId exists, shift is in shiftTemplatesMap and marked as deleted', () => {
      mockShiftTemplateStore.shiftTemplatesMap = {
        2: {
          id: 2, name: 'template 2', stationIds: [1], startTime: '12:00', endTime: '17:00', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'], deleted: true,
        },
      };
      vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
      const wrapper = shallowMount(SettingsShiftsEdit);

      expect(wrapper.vm.isRemovedShiftTemplate).toBe(true);
    });

    it('returns true if shiftId exists and shift is not in shiftTemplatesMap', () => {
      mockShiftTemplateStore.shiftTemplatesMap = {
        3: {
          id: 3, name: 'template 3', stationIds: [1], startTime: '12:00', endTime: '17:00', daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
        },
      };
      vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });
      const wrapper = shallowMount(SettingsShiftsEdit);

      expect(wrapper.vm.isRemovedShiftTemplate).toBe(true);
    });
  });

  describe('onDelete', () => {
    it('opens confirm dialog with correct config', async () => {
      const wrapper = shallowMount(SettingsShiftsEdit);

      // ensure formData has a name
      wrapper.vm.formData.id = 123;
      wrapper.vm.formData.name = 'Test Shift';

      await wrapper.vm.onDelete();
      await nextTick();
      expect(mockConfirmDialogStore.openConfirmDialog).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Confirmation',
        text: expect.stringContaining('Are you sure you want to delete {value}?'),
        confirmText: 'Delete',
        cancelText: 'Cancel',
        action: expect.any(Function),
      }));
    });

    it('executes delete action and navigates on confirm', async () => {
      mockShiftTemplateStore.deleteShiftTemplate.mockResolvedValue();

      const pushMock = vi.fn();
      vi.mocked(router).useRouter.mockReturnValue({ push: pushMock });
      vi.mocked(router).useRoute.mockReturnValue({ params: { id: 2 } });

      const wrapper = shallowMount(SettingsShiftsEdit);

      wrapper.vm.formData.id = 222;
      wrapper.vm.formData.name = 'DeleteMe';

      await wrapper.vm.onDelete();

      // find the confirmDialog payload from Pinia mock
      expect(mockConfirmDialogStore.openConfirmDialog).toHaveBeenCalled();
      const dialogConfig = mockConfirmDialogStore.openConfirmDialog.mock.calls[0][0];
      expect(typeof dialogConfig.action).toBe('function');

      // run the action (simulate user confirming)
      await dialogConfig.action();

      expect(mockShiftTemplateStore.deleteShiftTemplate).toHaveBeenCalledWith(wrapper.vm.formData);
      expect(pushMock).toHaveBeenCalled();
    });
  });

  describe('onDayClick', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        daysOfWeek: [],
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData: { ...formData }, // Ensure a fresh copy
            days: [
              { id: 'MONDAY' },
              { id: 'TUESDAY' },
              { id: 'WEDNESDAY' },
            ],
          };
        },
      });
    });

    it('adds a day to daysOfWeek if not already selected', async () => {
      const day = { id: 'MONDAY' };
      wrapper.vm.formData.daysOfWeek = [];
      wrapper.vm.onDayClick(day);
      await nextTick();

      // Ensure reactivity is working and the state is updated
      expect(wrapper.vm.formData.daysOfWeek).toContain('MONDAY');
    });

    it('removes a day from daysOfWeek if already selected', async () => {
      wrapper.vm.formData.daysOfWeek = ['MONDAY'];
      const day = { id: 'MONDAY' };
      wrapper.vm.onDayClick(day);
      await nextTick();

      // Ensure reactivity is working and the state is updated
      expect(wrapper.vm.formData.daysOfWeek).not.toContain('MONDAY');
    });
  });

  describe('getEnabledDays', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        daysOfWeek: ['MONDAY', 'WEDNESDAY'],
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
            days: [
              { id: 'MONDAY' },
              { id: 'TUESDAY' },
              { id: 'WEDNESDAY' },
            ],
          };
        },
      });
    });

    it('returns only the enabled days', () => {
      wrapper.vm.formData.daysOfWeek = ['MONDAY', 'WEDNESDAY'];
      const enabledDays = wrapper.vm.getEnabledDays();

      expect(enabledDays).toEqual([{
        id: 'MONDAY',
        order: 0,
        shortText: 'Mon',
        text: 'Monday',
      },
      {
        id: 'WEDNESDAY',
        order: 2,
        shortText: 'Wed',
        text: 'Wednesday',
      }]);
    });

    it('returns an empty array if no days are enabled', () => {
      wrapper.vm.formData.daysOfWeek = [];
      const enabledDays = wrapper.vm.getEnabledDays();

      expect(enabledDays).toEqual([]);
    });
  });

  describe('getDayEndTime', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        dateConfig: {
          MONDAY: { endTime: '18:00' },
          TUESDAY: { endTime: '20:00' },
        },
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
          };
        },
      });
    });

    it('returns the end time for a given day', () => {
      wrapper.vm.formData.dateConfig = {
        MONDAY: { endTime: '18:00' },
        TUESDAY: { endTime: '20:00' },
      };
      const endTime = wrapper.vm.getDayEndTime('MONDAY');


      expect(endTime).toBe('18:00');
    });

    it('returns undefined if the day does not exist in dateConfig', () => {
      const endTime = wrapper.vm.getDayEndTime('WEDNESDAY');

      expect(endTime).toBeUndefined();
    });
  });

  describe('getDayStartTime', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        dateConfig: {
          MONDAY: { startTime: '08:00' },
          TUESDAY: { startTime: '09:00' },
        },
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
          };
        },
      });
    });

    it('returns the start time for a given day', () => {
      wrapper.vm.formData.dateConfig = {
        MONDAY: { startTime: '08:00' },
        TUESDAY: { startTime: '09:00' },
      };
      const startTime = wrapper.vm.getDayStartTime('MONDAY');

      expect(startTime).toBe('08:00');
    });

    it('returns undefined if the day does not exist in dateConfig', () => {
      const startTime = wrapper.vm.getDayStartTime('WEDNESDAY');

      expect(startTime).toBeUndefined();
    });
  });

  describe('ensureDateConfig', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        dateConfig: null,
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
          };
        },
      });
    });

    it('initializes dateConfig if it is null', () => {
      const dateConfig = wrapper.vm.ensureDateConfig();

      expect(dateConfig).toEqual({});
      expect(wrapper.vm.formData.dateConfig).toEqual({});
    });

    it('returns the existing dateConfig if it is already initialized', () => {
      wrapper.vm.formData.dateConfig = { MONDAY: { startTime: '08:00' } };
      const dateConfig = wrapper.vm.ensureDateConfig();

      expect(dateConfig).toEqual({ MONDAY: { startTime: '08:00' } });
    });
  });

  describe('setDayEndTime', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        dateConfig: {
          MONDAY: { endTime: '18:00' },
          TUESDAY: { endTime: '20:00' },
        },
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
          };
        },
      });
    });

    it('updates the endTime for a given day', () => {
      wrapper.vm.setDayEndTime('MONDAY', '19:00');

      expect(wrapper.vm.formData.dateConfig.MONDAY.endTime).toBe('19:00');
    });

    it('creates a new entry if the day does not exist in dateConfig', () => {
      wrapper.vm.setDayEndTime('WEDNESDAY', '21:00');

      expect(wrapper.vm.formData.dateConfig.WEDNESDAY).toEqual({ endTime: '21:00' });
    });

    it('preserves other properties in the day config when updating endTime', () => {
      wrapper.vm.formData.dateConfig.MONDAY = { startTime: '08:00' };
      wrapper.vm.setDayEndTime('MONDAY', '19:00');

      expect(wrapper.vm.formData.dateConfig.MONDAY).toEqual({ startTime: '08:00', endTime: '19:00' });
    });
  });

  describe('setDayStartTime', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        dateConfig: {
          MONDAY: { startTime: '08:00' },
          TUESDAY: { startTime: '09:00' },
        },
      };

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        data() {
          return {
            formData,
          };
        },
      });
    });

    it('updates the startTime for a given day', () => {
      wrapper.vm.setDayStartTime('MONDAY', '07:00');

      expect(wrapper.vm.formData.dateConfig.MONDAY.startTime).toBe('07:00');
    });

    it('creates a new entry if the day does not exist in dateConfig', () => {
      wrapper.vm.setDayStartTime('WEDNESDAY', '06:00');

      expect(wrapper.vm.formData.dateConfig.WEDNESDAY).toEqual({ startTime: '06:00' });
    });

    it('preserves other properties in the day config when updating startTime', () => {
      wrapper.vm.formData.dateConfig.MONDAY = { endTime: '18:00' };
      wrapper.vm.setDayStartTime('MONDAY', '07:00');

      expect(wrapper.vm.formData.dateConfig.MONDAY).toEqual({ startTime: '07:00', endTime: '18:00' });
    });
  });

  describe('onCopyShiftDayTimes', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
      });

      // Set the formData directly on the component instance
      wrapper.vm.formData.daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
      wrapper.vm.formData.dateConfig = {
        MONDAY: { startTime: '08:00', endTime: '17:00' },
        TUESDAY: { startTime: '09:00', endTime: '18:00' },
      };
    });

    it('copies configuration from source day to all enabled days', () => {
      wrapper.vm.onCopyShiftDayTimes('MONDAY');

      expect(wrapper.vm.formData.dateConfig).toEqual({
        MONDAY: { startTime: '08:00', endTime: '17:00' },
        TUESDAY: { startTime: '08:00', endTime: '17:00' },
        WEDNESDAY: { startTime: '08:00', endTime: '17:00' },
      });
    });

    it('does nothing when source day has no configuration', () => {
      const originalDateConfig = { ...wrapper.vm.formData.dateConfig };
      wrapper.vm.onCopyShiftDayTimes('WEDNESDAY');

      expect(wrapper.vm.formData.dateConfig).toEqual(originalDateConfig);
    });

    it('overwrites existing configurations for enabled days', () => {
      wrapper.vm.formData.dateConfig = {
        MONDAY: { startTime: '08:00', endTime: '17:00' },
        TUESDAY: { startTime: '10:00', endTime: '19:00' },
        WEDNESDAY: { startTime: '07:00', endTime: '16:00' },
      };

      wrapper.vm.onCopyShiftDayTimes('MONDAY');

      expect(wrapper.vm.formData.dateConfig).toEqual({
        MONDAY: { startTime: '08:00', endTime: '17:00' },
        TUESDAY: { startTime: '08:00', endTime: '17:00' },
        WEDNESDAY: { startTime: '08:00', endTime: '17:00' },
      });
    });
  });

  describe('onEditNoShiftDeviation', () => {
    let wrapper;

    beforeEach(() => {
      vi.clearAllMocks();
      mockShiftTemplateStore.shiftTemplatesMap = defaultShiftTemplatesMap;
      mockShiftTemplateStore.isLoading = false;
      mockShiftTemplateStore.fetchShiftTemplates = vi.fn();
      mockShiftTemplateStore.saveShiftTemplate = vi.fn();
      mockShiftTemplateStore.deleteShiftTemplate = vi.fn();

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
      });

      // Set form data directly
      wrapper.vm.formData.id = 2;
      wrapper.vm.formData.stationIds = [1];
      wrapper.vm.factoryId = 1; // This will make selectedFactoryAllowedStationIds return the correct stations
    });

    it('calls openEditNoShiftDialog with proper deviation data when editing existing item', async () => {
      const column = {
        item: {
          id: 456,
          description: 'Holiday',
          date: '2023-12-25',
        },
      };

      await wrapper.vm.onEditNoShiftDeviation(column);

      expect(mockOpenEditNoShiftDialog).toHaveBeenCalledWith({
        id: 456,
        description: 'Holiday',
        date: '2023-12-25',
        allowedStationIds: [1], // Only stations that have factoryId = 1
        stationIds: [1],
        shiftTemplateId: 2,
      });
    });

    it('calls openEditNoShiftDialog with default data when creating new item', async () => {
      await wrapper.vm.onEditNoShiftDeviation();

      expect(mockOpenEditNoShiftDialog).toHaveBeenCalledWith({
        allowedStationIds: [1], // Only stations that match the selected factory
        stationIds: [1],
        shiftTemplateId: 2,
      });
    });

    it('calls openEditNoShiftDialog with column.item data when column is provided', async () => {
      const column = {
        item: {
          id: 789,
          description: 'Maintenance',
          startDate: '2023-12-20',
          endDate: '2023-12-22',
        },
      };

      await wrapper.vm.onEditNoShiftDeviation(column);

      expect(mockOpenEditNoShiftDialog).toHaveBeenCalledWith({
        id: 789,
        description: 'Maintenance',
        startDate: '2023-12-20',
        endDate: '2023-12-22',
        allowedStationIds: [1], // Only stations that match the selected factory
        stationIds: [1],
        shiftTemplateId: 2,
      });
    });
  });

  describe('onDeleteNoShiftDeviation', () => {
    let wrapper;

    beforeEach(() => {
      vi.clearAllMocks();
      mockShiftTemplateStore.shiftTemplatesMap = defaultShiftTemplatesMap;
      mockShiftTemplateStore.isLoading = false;
      mockShiftTemplateStore.fetchShiftTemplates = vi.fn();
      mockShiftTemplateStore.saveShiftTemplate = vi.fn();
      mockShiftTemplateStore.deleteShiftTemplate = vi.fn();

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
      });
    });

    it('calls openDeleteNoShiftConfirmation with the deviation from column.item', () => {
      const column = {
        item: {
          id: 123,
          description: 'Holiday',
          date: '2023-12-25',
        },
      };

      wrapper.vm.onDeleteNoShiftDeviation(column);

      expect(mockOpenDeleteNoShiftConfirmation).toHaveBeenCalledWith({
        id: 123,
        description: 'Holiday',
        date: '2023-12-25',
      });
    });

    it('calls openDeleteNoShiftConfirmation with complex deviation data', () => {
      const column = {
        item: {
          id: 456,
          description: 'Maintenance Period',
          startDate: '2023-12-20',
          endDate: '2023-12-22',
          stationIds: [1, 2, 3],
          note: 'Annual maintenance',
        },
      };

      wrapper.vm.onDeleteNoShiftDeviation(column);

      expect(mockOpenDeleteNoShiftConfirmation).toHaveBeenCalledWith({
        id: 456,
        description: 'Maintenance Period',
        startDate: '2023-12-20',
        endDate: '2023-12-22',
        stationIds: [1, 2, 3],
        note: 'Annual maintenance',
      });
    });
  });

  describe('onDeleteTimeDeviation', () => {
    let wrapper;

    beforeEach(() => {
      vi.clearAllMocks();
      mockShiftTemplateStore.shiftTemplatesMap = defaultShiftTemplatesMap;
      mockShiftTemplateStore.isLoading = false;
      mockShiftTemplateStore.fetchShiftTemplates = vi.fn();
      mockShiftTemplateStore.saveShiftTemplate = vi.fn();
      mockShiftTemplateStore.deleteShiftTemplate = vi.fn();

      wrapper = shallowMount(SettingsShiftsEdit, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
      });
    });

    it('calls openDeleteTimeDeviationConfirmation with the deviation from column.item', () => {
      const column = {
        item: {
          id: 123,
          shiftTemplateId: 456,
          date: '2023-12-25',
          startTime: '09:00',
          endTime: '17:30',
        },
      };

      wrapper.vm.onDeleteTimeDeviation(column);

      expect(mockOpenDeleteTimeDeviationConfirmation).toHaveBeenCalledWith({
        id: 123,
        shiftTemplateId: 456,
        date: '2023-12-25',
        startTime: '09:00',
        endTime: '17:30',
      });
    });

    it('calls openDeleteTimeDeviationConfirmation with complex time deviation data', () => {
      const column = {
        item: {
          id: 789,
          shiftTemplateId: 100,
          date: '2023-12-26',
          startTime: '08:30',
          endTime: '16:45',
          stationIds: [1, 2],
          reason: 'Holiday schedule',
        },
      };

      wrapper.vm.onDeleteTimeDeviation(column);

      expect(mockOpenDeleteTimeDeviationConfirmation).toHaveBeenCalledWith({
        id: 789,
        shiftTemplateId: 100,
        date: '2023-12-26',
        startTime: '08:30',
        endTime: '16:45',
        stationIds: [1, 2],
        reason: 'Holiday schedule',
      });
    });
  });
});
