import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsStopReasonsOverview from './index.vue';

import useDeviceStore from '@/stores/device';
import commentApi from '@/api/commentApi';
import downloadFile from '@/helpers/file/downloadFile';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

vi.mock('@/api/commentApi');
const getBarcodes = vi.fn(() => 'blob');
commentApi.getBarcodes = getBarcodes;

vi.mock('@/helpers/file/downloadFile', () => ({
  default: vi.fn(),
  __esModule: true,
}));


const router = {
  $router: {
    push: vi.fn(),
  },
};

const route = {
  $route: {
    name: 'commentOverview',
    params: {
      isGroupEdit: false,
    },
    query: {},
  },
};

const defaultPiniaState = {
  profile: { currentUser: { roles: { 21: 'FACTORY_ADMIN' } }, highestUserRole: 'FACTORY_ADMIN' },
  factory: {
    factories: [{ id: 21, name: 'Factory1' }, { id: 22, name: 'Factory2' }],
  },
  station: {
    stations: [],
    stationGroups: [],
  },
  comment: {
    commentsList: [
      {
        id: 11, name: 'comment1', groupId: 1, factoryIds: [21], stationIds: [31],
      },
      {
        id: 12, name: 'comment2', groupId: 2, factoryIds: [21], stationIds: [31],
      },
      {
        id: 13, name: 'comment3', groupId: 1, factoryIds: [21], stationIds: [],
      },
      {
        id: 14, name: 'comment4', groupId: 2, factoryIds: [21], stationIds: [],
      },
      {
        id: 15, name: 'comment5', groupId: 1, factoryIds: [], stationIds: [],
      },
      {
        id: 16, name: 'comment6', groupId: 2, factoryIds: [], stationIds: [],
      },
      {
        id: 17, name: 'comment7', groupId: 3, factoryIds: [22], stationIds: [],
      },
      {
        id: 18, name: 'comment8', groupId: 3, factoryIds: [], stationIds: [],
      },
    ],
    commentGroupsList: [
      {
        id: 1, name: 'testGroup1', local: false, factoryIds: [],
      },
      {
        id: 2, name: 'testGroup2', local: true, factoryIds: [21],
      },
    ],
  },
  configuration: { configuration: {} },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...overrides },
  });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

const createWrapper = (piniaOverrides = {}) => shallowMount(SettingsStopReasonsOverview, {
  global: {
    plugins: [createPinia(piniaOverrides)],
    mocks: { ...router, ...route },
  },
});

describe('SettingsStopReasonsOverview', () => {
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

  it('renders correctly with import/export option', () => {
    const wrapper = createWrapper({
      profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
      configuration: { configuration: { settingsDataExportReports: [{ id: 'comment', name: 'StopReasonExport' }] } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when userHasGlobalGroupsIcon is false', () => {
    // COMPANY_ADMIN with single factory: not FACTORY_ADMIN in currentRoles and only one factory
    const wrapper = createWrapper({
      profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
      factory: { factories: [{ id: 21, name: 'Factory1' }] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('onBarcodeDownload with just one factory', () => {
    const wrapper = createWrapper({
      factory: { factories: [{ id: 21, name: 'Factory1' }] },
    });

    const downloadBarCodes = vi.spyOn(wrapper.vm, 'downloadBarCodes');

    expect(downloadBarCodes).toHaveBeenCalledTimes(0);
    wrapper.vm.onBarcodeDownload();
    expect(downloadBarCodes).toHaveBeenCalledTimes(1);
  });

  test('onBarcodeDownload with multiple factories', () => {
    const factories = [{ id: 1, name: 'factory 1' }, { id: 2, name: 'factory 2' }];
    const wrapper = createWrapper({
      factory: { factories },
    });

    const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

    expect(openDialog).toHaveBeenCalledTimes(0);
    wrapper.vm.onBarcodeDownload();
    expect(openDialog).toHaveBeenCalledTimes(1);
  });

  describe('isListViewVisible', () => {
    it('returns true if toggleBtnValue is LIST', () => {
      const wrapper = createWrapper();
      wrapper.vm.toggleBtnValue = builtInViewTypes.LIST;
      expect(wrapper.vm.isListViewVisible).toBe(true);
    });

    it('returns false if toggleBtnValue is GROUPS', () => {
      const wrapper = createWrapper();
      wrapper.vm.toggleBtnValue = builtInViewTypes.GROUPS;
      expect(wrapper.vm.isListViewVisible).toBe(false);
    });
  });

  describe('3-dot menu items', () => {
    it('has data import/export and save as barcodes options if highestRoleAllows is true and settingsDataExportReports includes comment report', () => {
      const wrapper = createWrapper({
        profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
        configuration: { configuration: { settingsDataExportReports: [{ id: 'comment', name: 'StopReasonExport' }] } },
      });

      const { menuItems } = wrapper.vm;
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].text).toBe('Data export and import');
      expect(menuItems[1].text).toBe('Save stops as barcodes');
    });

    it('has only save as barcodes option if highestRoleAllows is false', () => {
      const wrapper = createWrapper({
        profile: { currentUser: { roles: { 21: 'FACTORY_ADMIN' } }, highestUserRole: 'FACTORY_ADMIN' },
        configuration: { configuration: { settingsDataExportReports: [{ id: 'comment', name: 'StopReasonExport' }] } },
      });

      const { menuItems } = wrapper.vm;
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].text).toBe('Save stops as barcodes');
    });

    it('has only save as barcodes option if configuration does not include settingsDataExportReports', () => {
      const wrapper = createWrapper();

      const { menuItems } = wrapper.vm;
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].text).toBe('Save stops as barcodes');
    });

    it('has only save as barcodes option if highestRoleAllows is false and configuration does not include settingsDataExportReports', () => {
      const wrapper = createWrapper({
        profile: { currentUser: { roles: { 21: 'FACTORY_ADMIN' } }, highestUserRole: 'FACTORY_ADMIN' },
      });

      const { menuItems } = wrapper.vm;
      expect(menuItems.length).toBe(1);
      expect(wrapper.vm.menuItems[0].text).toBe('Save stops as barcodes');
    });
  });

  test('that downloadBarCodes calls getBarcodes and downloadFile with each factory', async () => {
    const factories = [{ id: 1, name: 'factory 1' }, { id: 2, name: 'factory 2' }];
    const wrapper = createWrapper({
      factory: { factories },
    });

    await wrapper.vm.downloadBarCodes([1, 2]);

    expect(getBarcodes).toHaveBeenCalledTimes(2);
    expect(getBarcodes).toHaveBeenNthCalledWith(1, { factoryId: 1 });
    expect(getBarcodes).toHaveBeenNthCalledWith(2, { factoryId: 2 });
    expect(downloadFile).toHaveBeenCalledTimes(2);
    expect(downloadFile).toHaveBeenNthCalledWith(1, 'blob', 'factory 1 stops.pdf');
    expect(downloadFile).toHaveBeenNthCalledWith(2, 'blob', 'factory 2 stops.pdf');
  });
});
