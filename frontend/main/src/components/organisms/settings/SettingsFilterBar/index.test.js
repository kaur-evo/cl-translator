import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiFormatListGroup, mdiFormatListBulleted } from '@mdi/js';

import SettingsFilterBar from './index.vue';

import useFilterbarStore from '@/stores/filterbar';
import useDeviceStore from '@/stores/device';

const router = {
  $router: {
    replace: vi.fn(),
  },
};

const mocks = {
  ...router,
};

const propsDefault = {
  filterConfiguration: new Map(),
};

const createPinia = ({ isMobileView = false, screenOverride } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      device: {
        screen: screenOverride ?? { width: 1920, height: 1080 },
        isBrowserTabActive: true,
      },
      routeModule: { query: {} },
      filterbar: {
        currentFilterState: {},
        requestFilterState: {},
        calculatedFilterConfig: new Map([
          ['search', {}],
          ['factoryId', {}],
          ['stationId', {}],
        ]),
      },
    },
    stubActions: false,
  });
  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = () => ['search', 'factoryId', 'stationId'];
  filterbarStore.notAppliedFilters = [{ label: 'Status' }, { label: 'Type' }];
  useDeviceStore(pinia).isMobileView = isMobileView;
  return pinia;
};

describe('SettingsFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsFilterBar, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
        mocks,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsFilterBar, {
      props: { ...propsDefault, toggleBtnItems: [{ text: 'Btn1', icon: mdiFormatListGroup }, { text: 'Btn2', icon: mdiFormatListBulleted }] },
      global: {
        plugins: [createPinia()],
        stubs: { 'filter-bar': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(SettingsFilterBar, {
      props: { ...propsDefault, toggleBtnItems: [{ text: 'Btn1', icon: mdiFormatListGroup }, { text: 'Btn2', icon: mdiFormatListBulleted }] },
      global: {
        plugins: [createPinia({ isMobileView: true, screenOverride: { width: 400, height: 800 } })],
        stubs: { 'filter-bar': false, 'mobile-filter-bar': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without toggle button', () => {
    const wrapper = shallowMount(SettingsFilterBar, {
      props: { ...propsDefault, toggleBtnItems: [] },
      global: {
        plugins: [createPinia()],
        stubs: { 'filter-bar': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
