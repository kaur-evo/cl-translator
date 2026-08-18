import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsMain from './index.vue';

import useConfigurationStore from '@/stores/configuration';

const $route = { name: 'settings' };

const defaultFeatureState = {
  checklists: true,
  alerts: true,
  tags: true,
  qualityYield: true,
  apiAccess: true,
  activityLogs: true,
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      profile: {
        currentUser: { fullName: 'Test User', roles: { 0: 'COMPANY_ADMIN' } },
        highestUserRole: overrides.highestUserRole || 'COMPANY_ADMIN',
      },
      device: {
        screen: { width: overrides.screenWidth || 1920, height: 1080 },
      },
      routeModule: {},
      feature: defaultFeatureState,
    },
  });
  useConfigurationStore(pinia).adminChecklistStations = [1, 2];
  return pinia;
};

describe('SettingsMain', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsMain, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: ['router-link'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(SettingsMain, {
      global: {
        plugins: [createPinia({ screenWidth: 400 })],
        mocks: { $route },
        stubs: ['router-link'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when settings are not allowed', () => {
    const wrapper = shallowMount(SettingsMain, {
      global: {
        plugins: [createPinia({ highestUserRole: 'LINEVIEW_USER' })],
        mocks: { $route },
        stubs: ['router-link'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
