import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsStationsEdit from './index.vue';

import useDeviceStore from '@/stores/device';
import messageApi from '@/api/messageApi';
import stationApi from '@/api/stationApi';

vi.mock('@/api/messageApi');
vi.mock('@/api/stationApi');
messageApi.getStationAddress = () => 'test@email.com';

document.body.setAttribute('data-app', true);

const defaultPiniaInitialState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } } },
  station: {
    stations: [
      { id: 1, factoryId: 1, requireLotBatch: false, requireChangeoverNote: false },
      { id: 2, factoryId: 4, requireLotBatch: false, requireChangeoverNote: false },
    ],
    stationGroups: [
      { id: 1, factoryId: 1 },
      { id: 2, factoryId: 1 },
      { id: 3, factoryId: 2 },
      { id: 4, factoryId: 3 },
      { id: 5, factoryId: 3 },
    ],
    loading: [],
  },
};

const createPiniaWithDeviceStore = (options = {}) => {
  const pinia = createTestingPinia(options);
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.screenWidth = 1024;
  deviceStore.screen = {};
  return pinia;
};

describe('SettingsStationsEdit', () => {
  it('renders correctly', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        mocks: { $route: { params: { id: 1 } } },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if selected station is not in stationsMap', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, factoryId: 1, name: 'Station1', requireLotBatch: false, requireChangeoverNote: false }],
            },
          },
        })],
        mocks: { $route: { params: { id: 2 } } },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if notificationEmails are provided and valid', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, notificationEmails: 'test@email.com,test2@email.ee', requireLotBatch: false, requireChangeoverNote: false }],
            },
          },
        })],
        mocks: { $route: { params: { id: 1 } } },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if notificationEmails are provided and one of them is invalid', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, notificationEmails: 'test@email.com,test2@', requireLotBatch: false, requireChangeoverNote: false }],
            },
          },
        })],
        mocks: { $route: { params: { id: 1 } } },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('shows only scrap reasons for selected station', () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, requireLotBatch: false, requireChangeoverNote: false }],
            },
            scrapReason: {
              scrapReasonsList: [
                { id: 1, stationIds: [] },
                { id: 2, stationIds: [1] },
                { id: 3, stationIds: [1, 2] },
                { id: 4, stationIds: [2] },
                { id: 5, stationIds: [1, 3] },
              ],
            },
          },
        })],
        mocks: { $route: { params: { id: 1 } } },
      },
    });

    expect(wrapper.vm.stationScrapReasons.length).toBe(3);
    expect(wrapper.vm.stationScrapReasons).toEqual([{ id: 2, stationIds: [1] }, { id: 3, stationIds: [1, 2] }, { id: 5, stationIds: [1, 3] }]);
  });

  test('that filteredGroups has only same factory groups', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        mocks: { $route: { params: { id: 1 } } },
      },
    });

    await flushPromises();
    expect(wrapper.vm.filteredGroups).toEqual([{ id: 1, factoryId: 1 }, { id: 2, factoryId: 1 }]);
  });

  test('manual shift input is disabled when showManualShift is false', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, showManualShift: false, requireLotBatch: false, requireChangeoverNote: false }],
            },
          },
        })],
        mocks: { $route: { params: { id: 1 } } },
        stubs: {
          'v-expansion-panels': { template: '<div><slot /></div>' },
          'v-expansion-panel': { template: '<div><slot /></div>' },
          'v-expansion-panel-text': { template: '<div><slot /></div>' },
          'form-page-template': false,
        },
      },
    });
    await flushPromises();

    const manualShiftInput = wrapper.find('#manual-shift-name-input');
    expect(manualShiftInput.exists()).toBe(true);
    expect(manualShiftInput.attributes('disabled')).toBe('true');
  });

  test('manual shift input is enabled when showManualShift is true', async () => {
    const wrapper = shallowMount(SettingsStationsEdit, {
      global: {
        plugins: [createPiniaWithDeviceStore({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            station: {
              ...defaultPiniaInitialState.station,
              stations: [{ id: 1, showManualShift: true, requireLotBatch: false, requireChangeoverNote: false }],
            },
          },
        })],
        mocks: { $route: { params: { id: 1 } } },
        stubs: {
          'v-expansion-panels': { template: '<div><slot /></div>' },
          'v-expansion-panel': { template: '<div><slot /></div>' },
          'v-expansion-panel-text': { template: '<div><slot /></div>' },
          'form-page-template': false,
        },
      },
    });
    await flushPromises();

    const manualShiftInput = wrapper.find('#manual-shift-name-input');
    expect(manualShiftInput.exists()).toBe(true);
    expect(manualShiftInput.attributes('disabled')).toBe('false');
  });

  describe('onSave', () => {
    it('does not call saveStation if valid is false', async () => {
      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                stations: [{ id: 1, name: 'station1', notificationEmails: 'test@email.com,test2@email.ee', requireLotBatch: false, requireChangeoverNote: false }],
              },
            },
          })],
          mocks: { $route: { params: { id: 1 } } },
        },
      });

      const saveStationSpy = vi.spyOn(wrapper.vm, 'saveStation');
      wrapper.vm.validate = () => {
        wrapper.vm.valid = false;
      };
      await wrapper.vm.onSave();
      expect(saveStationSpy).not.toHaveBeenCalled();
    });

    it('calls saveStation with correct params and calls goBackToOverview if valid', async () => {
      const stationData = { id: 1, name: 'station1', notificationEmails: 'test@email.com,test2@email.ee', requireLotBatch: false, requireChangeoverNote: false };
      stationApi.putStation = vi.fn().mockResolvedValue(stationData);

      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                stations: [stationData],
              },
            },
          })],
          mocks: { $route: { params: { id: 1 } }, $router: { push: vi.fn() } },
        },
        computed: {
          ...SettingsStationsEdit.computed,
          isFormValid: () => true,
        },
      });

      const saveStationSpy = vi.spyOn(wrapper.vm, 'saveStation');
      wrapper.vm.validate = () => {
        wrapper.vm.valid = true;
      };
      await wrapper.vm.onSave();
      expect(saveStationSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'station1',
        notificationEmails: 'test@email.com,test2@email.ee',
        requireLotBatch: false,
        requireChangeoverNote: false,
      }));
    });
  });

  describe('isRemovedStation', () => {
    it('returns false if isLoading is true', () => {
      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                loading: ['loading'],
              },
            },
          })],
          mocks: { $route: { params: { id: 1 } } },
        },
      });

      expect(wrapper.vm.isRemovedStation).toBe(false);
    });

    it('returns false if station is in stationsMap and not marked as deleted', () => {
      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                stations: [{ id: 2, factoryId: 4, name: 'station2', deleted: false, requireLotBatch: false, requireChangeoverNote: false }],
              },
            },
          })],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedStation).toBe(false);
    });

    it('returns true if station is in stationsMap and marked as deleted', () => {
      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                stations: [{ id: 2, factoryId: 4, name: 'station2', deleted: true, requireLotBatch: false, requireChangeoverNote: false }],
              },
            },
          })],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedStation).toBe(true);
    });

    it('returns true if isLoading is false and station is not in stationsMap', () => {
      const wrapper = shallowMount(SettingsStationsEdit, {
        global: {
          plugins: [createPiniaWithDeviceStore({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              station: {
                ...defaultPiniaInitialState.station,
                loading: [],
                stations: [{ id: 2, factoryId: 4, name: 'station2', requireLotBatch: false, requireChangeoverNote: false }],
              },
            },
          })],
          mocks: { $route: { params: { id: 1 } } },
        },
      });

      expect(wrapper.vm.isRemovedStation).toBe(true);
    });
  });
});
