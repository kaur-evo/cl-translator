import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { checklistTypes, periodicSubTypes } from '@/constants/checklistsConstants';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import productApi from '@/api/productApi';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useGenericDialogStore from '@/stores/genericDialog';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/productApi');
productApi.getFilteredProducts = vi.fn();

const defaultChecklists = [{ id: 1, stationIds: [11, 12], frequency: { productIds: [1, 2, 3], type: 'CHANGEOVER' } }];

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      checklistTemplate: {
        checklistTemplates: overrides.checklistTemplates || defaultChecklists,
        checklistGroups: [{ id: 1, name: 'group-1' }, { id: 2, name: 'group-2' }],
        loading: [],
      },
      station: {
        stations: [
          { id: 11, name: 'Station 11', factoryId: 1 },
          { id: 12, name: 'Station 12', factoryId: 1 },
        ],
      },
      factory: {
        factories: [{ id: 1, name: 'factory1', stations: [{ id: 11, name: 'Station 11' }, { id: 12, name: 'Station 12' }] }],
      },
      configuration: {
        configuration: { checklistStations: [] },
      },
      feature: {
        checklists: true,
      },
      profile: {
        currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
      },
    },
  });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(index, {
  global: { plugins: [createPinia(overrides)] },
});

describe('SettingsChecklistsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that frequencies array is correct', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.frequencies).toEqual([
      { id: checklistTypes.INTERVAL, name: 'Regular intervals' },
      { id: checklistTypes.CHANGEOVER, name: 'Changeover' },
      { id: checklistTypes.QUANTITY, name: 'Quantity produced' },
      { id: checklistTypes.STOPREASON, name: 'Downtime reason' },
      { id: checklistTypes.MANUAL, name: 'Manual activation' },
      { id: checklistTypes.SHIFT, name: 'Shift time' },
      { id: periodicSubTypes.DAILY, name: 'Daily' },
      { id: periodicSubTypes.WEEKLY, name: 'Weekly' },
      { id: periodicSubTypes.MONTHLY, name: 'Monthly' },
    ]);
  });

  test('that all checklists are in tableChecklists array', () => {
    const wrapper = createWrapper({
      checklistTemplates: [
        { id: 1, stationIds: [11, 12], frequency: { productIds: [1], type: 'CHANGEOVER' } },
        { id: 2, stationIds: [12], frequency: { productIds: [11], type: 'CHANGEOVER' } },
        { id: 3, stationIds: [11], frequency: { productIds: [52], type: 'CHANGEOVER' } },
      ],
    });

    expect(wrapper.vm.tableChecklists.length).toBe(3);
  });

  test('that tableChecklists array contains correct frequencyTableItem and type if frequency type is PERIODIC and subType is DAILY', () => {
    const wrapper = createWrapper({
      checklistTemplates: [
        { id: 1, stationIds: [11, 12], frequency: { productIds: [1], type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY, times: ['12:00'] } },
      ],
    });

    expect(wrapper.vm.tableChecklists.length).toBe(1);
    expect(wrapper.vm.tableChecklists[0].frequencyTableItem).toBe('Daily');
    expect(wrapper.vm.tableChecklists[0].type).toBe(periodicSubTypes.DAILY);
  });

  test('that tableChecklists array contains correct frequencyTableItem and type if frequency type is MANUAL', () => {
    const wrapper = createWrapper({
      checklistTemplates: [
        { id: 1, stationIds: [11, 12], frequency: { productIds: [1], type: checklistTypes.MANUAL } },
      ],
    });

    expect(wrapper.vm.tableChecklists.length).toBe(1);
    expect(wrapper.vm.tableChecklists[0].frequencyTableItem).toBe('Manual activation');
    expect(wrapper.vm.tableChecklists[0].type).toBe(checklistTypes.MANUAL);
  });

  describe('isListViewOpen', () => {
    it('returns true if toggleBtnValue is LIST', () => {
      const wrapper = createWrapper();

      wrapper.vm.toggleBtnValue = builtInViewTypes.LIST;
      expect(wrapper.vm.isListViewOpen).toBe(true);
    });

    it('returns false if toggleBtnValue is GROUPS', () => {
      const wrapper = createWrapper();

      wrapper.vm.toggleBtnValue = builtInViewTypes.GROUPS;
      expect(wrapper.vm.isListViewOpen).toBe(false);
    });
  });

  describe('onStatusChange', () => {
    it('calls openDialog with correct config if checklist is active and type is INTERVAL', () => {
      const wrapper = createWrapper();
      const genericDialogStore = useGenericDialogStore();
      const openDialogSpy = vi.spyOn(genericDialogStore, 'openDialog');

      const checklist = { id: 1, active: true, frequency: { type: 'INTERVAL' } };
      wrapper.vm.onStatusChange(checklist);
      expect(openDialogSpy).toHaveBeenCalledTimes(1);
      expect(openDialogSpy).toHaveBeenCalledWith({
        title: 'Confirmation',
        width: '400px',
        data: { checklist },
        allowFullscreen: false,
        component: expect.any(Object),
      });
    });

    it('calls saveChecklist if checklist is not active and type is INTERVAL', () => {
      const wrapper = createWrapper();
      const checklistTemplateStore = useChecklistTemplateStore();
      const saveChecklistSpy = vi.spyOn(checklistTemplateStore, 'saveChecklist');
      const genericDialogStore = useGenericDialogStore();
      const openDialogSpy = vi.spyOn(genericDialogStore, 'openDialog');

      const checklist = { id: 1, active: false, frequency: { type: 'INTERVAL' } };
      wrapper.vm.onStatusChange(checklist);
      expect(openDialogSpy).not.toHaveBeenCalled();
      expect(saveChecklistSpy).toHaveBeenCalledTimes(1);
      expect(saveChecklistSpy).toHaveBeenCalledWith(checklist);
    });

    it('calls saveChecklist if checklist is active and type is not INTERVAL', () => {
      const wrapper = createWrapper();
      const checklistTemplateStore = useChecklistTemplateStore();
      const saveChecklistSpy = vi.spyOn(checklistTemplateStore, 'saveChecklist');
      const genericDialogStore = useGenericDialogStore();
      const openDialogSpy = vi.spyOn(genericDialogStore, 'openDialog');

      const checklist = { id: 1, active: true, frequency: { type: 'DOWNTIME' } };
      wrapper.vm.onStatusChange(checklist);
      expect(openDialogSpy).not.toHaveBeenCalled();
      expect(saveChecklistSpy).toHaveBeenCalledTimes(1);
      expect(saveChecklistSpy).toHaveBeenCalledWith(checklist);
    });
  });
});
