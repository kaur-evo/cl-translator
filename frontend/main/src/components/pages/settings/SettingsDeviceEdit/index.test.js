/* eslint-disable sonarjs/no-hardcoded-passwords */
import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsDeviceEdit from './index.vue';

import devicesApi from '@/api/devicesApi';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/devicesApi');
devicesApi.getDeviceById.mockResolvedValue({});

const $route = {
  params: {
    id: 1,
  },
};

const createPinia = ({ isMobileView = false } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  useStationStore(pinia).stationsMap = { 1: { id: 1, name: 'Station 1' } };
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  deviceStore.screenWidth = 1920;
  return pinia;
};

describe('SettingsDeviceEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:33'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsDeviceEdit, {
      global: { plugins: [createPinia()], mocks: { $route } },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    devicesApi.getDeviceById.mockResolvedValueOnce({
      serialNumber: '1234',
      description: 'test description',
      hostname: 'Hostname',
      wifiMac: 'Wifi',
      ethernetMac: 'Ethernet',
      commandLinePassword: 'Command line password',
      lastOnline: '2020-01-01T12:29:33',
      offlineNotificationInterval: 720,
      version: 'v3',
      inputs: [{ inputNumber: 1, stationId: 1 }, { stationId: 0, inputNumber: 2 }, { stationId: 0, inputNumber: 3 }],
    });

    const wrapper = shallowMount(SettingsDeviceEdit, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', async () => {
    devicesApi.getDeviceById.mockResolvedValueOnce({
      serialNumber: '1234',
      description: 'test description',
      hostname: 'Hostname',
      wifiMac: 'Wifi',
      ethernetMac: 'Ethernet',
      commandLinePassword: 'Command line password',
      lastOnline: '2020-01-01T12:29:33',
      offlineNotificationInterval: 720,
      version: 'v3',
      inputs: [{ inputNumber: 1, stationId: 1 }, { stationId: 0, inputNumber: 2 }, { stationId: 0, inputNumber: 3 }],
    });

    const wrapper = shallowMount(SettingsDeviceEdit, {
      global: {
        plugins: [createPinia({ isMobileView: true })],
        mocks: { $route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly for v2 device', async () => {
    devicesApi.getDeviceById.mockResolvedValueOnce({
      serialNumber: '1234',
      description: 'test description',
      hostname: 'Hostname',
      wifiMac: 'Wifi',
      ethernetMac: 'Ethernet',
      commandLinePassword: 'Command line password',
      lastOnline: '2020-01-01T12:29:33',
      offlineNotificationInterval: 720,
      version: 'v2',
      inputs: [{ inputNumber: 1, stationId: 1 }, { stationId: 0, inputNumber: 2 }, { stationId: 0, inputNumber: 3 }],
    });

    const wrapper = shallowMount(SettingsDeviceEdit, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('columnSize', () => {
    it('returns 12 for mobile view', () => {
      const wrapper = shallowMount(SettingsDeviceEdit, {
        global: { plugins: [createPinia({ isMobileView: true })], mocks: { $route } },
      });

      expect(wrapper.vm.columnSize).toBe(12);
    });

    it('returns 4 if device version is v3', () => {
      const wrapper = shallowMount(SettingsDeviceEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      wrapper.setData({ formData: { version: 'v3' } });

      expect(wrapper.vm.columnSize).toBe(4);
    });

    it('returns 6 if device version is v2', () => {
      const wrapper = shallowMount(SettingsDeviceEdit, {
        global: { plugins: [createPinia()], mocks: { $route } },
      });

      wrapper.setData({ formData: { version: 'v2' } });

      expect(wrapper.vm.columnSize).toBe(6);
    });
  });
});
