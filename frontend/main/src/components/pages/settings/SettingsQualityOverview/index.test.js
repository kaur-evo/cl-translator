import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsQualityOverview from './index.vue';

import useDeviceStore from '@/stores/device';

const route = {
  $route: {
    name: 'qualityOverview',
  },
};

const router = {
  $router: {
    push: vi.fn(),
  },
};

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } } },
  station: {
    stations: [{ id: 1, name: 'Station 1' }, { id: 2, name: 'Station 2' }],
  },
  yield: {
    yields: [{
      yield: 10, stationId: 1, startDate: '2021-01-01', endDate: '2021-01-31', entryDate: '2021-01-05',
    }, {
      yield: 20, stationId: 2, startDate: '2021-02-01', endDate: '2021-02-28', entryDate: '2021-02-15',
    }],
  },
};

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaState });
  useDeviceStore(pinia).isMobileView = false;
  useDeviceStore(pinia).screenWidth = 1920;
  return pinia;
};

describe('SettingsQualityOverview', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsQualityOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { ...route, ...router },
        stubs: { 'form-page-template': false },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsQualityOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { ...route, ...router },
        stubs: { 'form-page-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
