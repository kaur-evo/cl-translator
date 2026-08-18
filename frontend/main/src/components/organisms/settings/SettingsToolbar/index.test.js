import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsToolbar from './index.vue';

import useDeviceStore from '@/stores/device';
import useProfileStore from '@/stores/profile';

const $route = {
  meta: { title: () => 'Test' },
  matched: [{ name: 'testOverview' }],
};

const defaultProps = {
  moduleName: 'testModule',
  isSettingsMainView: false,
  isOverviewOpen: true,
};

const createWrapper = (propsOverrides = {}, { isMobile = false, highestRoleAllowsFn = () => true, routeOverride } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const deviceStore = useDeviceStore(pinia);
  const profileStore = useProfileStore(pinia);
  deviceStore.isMobileView = isMobile;
  profileStore.highestRoleAllows = highestRoleAllowsFn;

  return shallowMount(SettingsToolbar, {
    propsData: { ...defaultProps, ...propsOverrides },
    global: {
      stubs: { 'main-app-toolbar': false },
      mocks: { $route: routeOverride || $route },
      plugins: [pinia],
    },
  });
};

describe('SettingsToolbar', () => {
  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly in settings main view', () => {
    const wrapper = createWrapper({ isSettingsMainView: true, isOverviewOpen: false });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without any buttons in mobile view', () => {
    const wrapper = createWrapper({}, { isMobile: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in device overview', () => {
    const wrapper = createWrapper({ moduleName: 'device' }, {
      routeOverride: { name: 'deviceOverview', meta: { title: () => 'Device' }, matched: [{ name: 'deviceOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in device overview in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'device' }, {
      isMobile: true,
      routeOverride: { name: 'deviceOverview', meta: { title: () => 'Device' }, matched: [{ name: 'deviceOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in position overview', () => {
    const wrapper = createWrapper({ moduleName: 'position' }, {
      routeOverride: { name: 'positionOverview', meta: { title: () => 'Position' }, matched: [{ name: 'positionOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in position overview in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'position' }, {
      isMobile: true,
      routeOverride: { name: 'positionOverview', meta: { title: () => 'Position' }, matched: [{ name: 'positionOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in positions edit', () => {
    const wrapper = createWrapper({ moduleName: 'positionEdit', isOverviewOpen: false }, {
      routeOverride: { name: 'positionEdit', meta: { title: () => 'Position' }, matched: [{ name: 'positionEdit' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in positions edit in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'positionEdit', isOverviewOpen: false }, {
      isMobile: true,
      routeOverride: { name: 'positionEdit', meta: { title: () => 'Position' }, matched: [{ name: 'positionEdit' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in stop reasons overview', () => {
    const wrapper = createWrapper({ moduleName: 'comment' }, {
      routeOverride: { name: 'commentOverview', meta: { title: () => 'Comments' }, matched: [{ name: 'commentOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in stop reasons overview in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'comment' }, {
      isMobile: true,
      routeOverride: { name: 'commentOverview', meta: { title: () => 'Comments' }, matched: [{ name: 'commentOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in user overview', () => {
    const wrapper = createWrapper({ moduleName: 'user' }, {
      routeOverride: { name: 'userOverview', meta: { title: () => 'User' }, matched: [{ name: 'userOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in user overview in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'user' }, {
      isMobile: true,
      routeOverride: { name: 'userOverview', meta: { title: () => 'User' }, matched: [{ name: 'userOverview' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in profile', () => {
    const wrapper = createWrapper({ moduleName: 'profile' }, {
      routeOverride: { name: 'profile', meta: { title: () => 'Profile' }, matched: [{ name: 'profile' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in profile in mobile', () => {
    const wrapper = createWrapper({ moduleName: 'profile' }, {
      isMobile: true,
      routeOverride: { name: 'profile', meta: { title: () => 'Profile' }, matched: [{ name: 'profile' }] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('hasBackButton', () => {
    it('returns true if not mobile view and highestRoleAllows is true', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.hasBackButton).toBe(true);
    });

    it('returns false in mobile view', () => {
      const wrapper = createWrapper({}, { isMobile: true });
      expect(wrapper.vm.hasBackButton).toBe(false);
    });

    it('returns false if highestRoleAllows is false', () => {
      const wrapper = createWrapper({}, { highestRoleAllowsFn: () => false });
      expect(wrapper.vm.hasBackButton).toBe(false);
    });
  });

  describe('onOpenHelp', () => {
    let windowOpenMock;

    beforeEach(() => {
      windowOpenMock = vi.spyOn(window, 'open').mockImplementation(() => {});
    });

    afterEach(() => {
      windowOpenMock.mockRestore();
    });

    it('calls window.open with correct url if moduleName is position', () => {
      const wrapper = createWrapper({ moduleName: 'position' });
      wrapper.vm.onOpenHelp();
      expect(windowOpenMock).toHaveBeenCalledWith('https://support.evocon.com/Using-locations-for-production-stop-reasons-6cce1437ebed42c0b133c45e0a031005', '_blank');
    });

    it('calls window.open with correct url if moduleName is shiftTemplate', () => {
      const wrapper = createWrapper({ moduleName: 'shiftTemplate' });
      wrapper.vm.onOpenHelp();
      expect(windowOpenMock).toHaveBeenCalledWith('https://support.evocon.com/Managing-work-shifts-a0109b9479f94f4888605419fa3170ce', '_blank');
    });

    it('calls window.open with correct url if moduleName is alert', () => {
      const wrapper = createWrapper({ moduleName: 'alert' });
      wrapper.vm.onOpenHelp();
      expect(windowOpenMock).toHaveBeenCalledWith('https://support.evocon.com/Managing-alerts-2d9209b4286642ffa42e92845944017e', '_blank');
    });

    it('calls window.open with correct url if moduleName is apiKeys', () => {
      const wrapper = createWrapper({ moduleName: 'apiKeys' });
      wrapper.vm.onOpenHelp();
      expect(windowOpenMock).toHaveBeenCalledWith('https://support.evocon.com/Using-API-keys-fea9b6e3c6214f6594d2b0e176d30171', '_blank');
    });
  });
});
