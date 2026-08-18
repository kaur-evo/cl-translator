import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import useDeviceStore from '@/stores/device';
import useShiftTemplateStore from '@/stores/shiftTemplate';

const defaultShiftTemplates = [{
  id: 1, name: 'Template1', startTime: '08:00', endTime: '16:00', factoryIds: [21], stationIds: [31], stationId: 31, daysOfWeek: ['MONDAY', 'FRIDAY'],
}, {
  id: 2, name: 'Template2', startTime: '17:00', endTime: '23:00', factoryIds: [21], stationIds: [31, 41], stationId: 31, daysOfWeek: ['MONDAY', 'FRIDAY'],
}];

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' }, firstDayOfWeek: 1 }, highestUserRole: 'COMPANY_ADMIN', language: 'et' },
  factory: {
    factories: [{ id: 21, name: 'Factory1' }],
  },
  station: {
    stations: [
      { id: 31, name: 'Station1', factoryId: 21 },
      { id: 41, name: 'Station2', factoryId: 21 },
    ],
    stationGroups: [],
  },
  shiftTemplate: {
    shiftTemplates: defaultShiftTemplates,
    loading: [],
  },
};

const createWrapper = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...overrides },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.screen = {};
  return shallowMount(index, {
    global: { plugins: [pinia] },
  });
};

describe('SettingsShiftsOverview', () => {
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

  test('that onOpenHelp calls window.open with correct params', () => {
    const wrapper = createWrapper();

    window.open = vi.fn();
    wrapper.vm.onOpenHelp();
    expect(window.open).toHaveBeenCalledWith('https://support.evocon.com/Managing-work-shifts-a0109b9479f94f4888605419fa3170ce', '_blank');
    window.open.mockRestore();
  });

  test('that tableShiftTemplates maps template correctly', () => {
    const template = {
      id: 1, name: 'Template1', startTime: '08:00', endTime: '16:00', factoryIds: [21], stationIds: [31], stationId: 31, daysOfWeek: ['MONDAY', 'FRIDAY', 'SUNDAY'],
    };
    const wrapper = createWrapper({
      shiftTemplate: { shiftTemplates: [template], loading: [] },
    });

    expect(wrapper.vm.tableShiftTemplates).toEqual([{
      ...template,
      shiftTime: '08:00 - 16:00',
      factoryNamesArray: ['Factory1'],
      stationNamesArray: ['Station1'],
      shiftDays: 'E, R, P',
    }]);
  });

  test('that tableShiftTemplates maps template correctly when Sunday is selected as first day of week', () => {
    const template = {
      id: 1, name: 'Template1', startTime: '08:00', endTime: '16:00', factoryIds: [21], stationIds: [31], stationId: 31, daysOfWeek: ['MONDAY', 'FRIDAY', 'SUNDAY'],
    };
    const wrapper = createWrapper({
      profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' }, firstDayOfWeek: 0 }, highestUserRole: 'COMPANY_ADMIN', language: 'et' },
      shiftTemplate: { shiftTemplates: [template], loading: [] },
    });

    expect(wrapper.vm.tableShiftTemplates).toEqual([{
      ...template,
      shiftTime: '08:00 - 16:00',
      factoryNamesArray: ['Factory1'],
      stationNamesArray: ['Station1'],
      shiftDays: 'P, E, R',
    }]);
  });

  it('calls fetchShiftTemplates action on mount', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: defaultPiniaState,
    });
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = false;
    deviceStore.screen = {};
    const shiftTemplateStore = useShiftTemplateStore(pinia);
    const spy = vi.spyOn(shiftTemplateStore, 'fetchShiftTemplates');

    shallowMount(index, { global: { plugins: [pinia] } });
    await flushPromises();
    expect(spy).toHaveBeenCalled();
  });
});
