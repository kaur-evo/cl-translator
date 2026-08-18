import { shallowMount } from '@vue/test-utils';

import SettingsDevicesOverview from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const route = {
  $route: {
    name: 'deviceOverview',
  },
};

const global = createGlobal({ router: { ...route } });

const createWrapper = (options) => shallowMount(SettingsDevicesOverview, {
  global: { ...global },
  ...options,
  computed: {
    modifiedData() {
      return [{ deviceId: 1, serialNumber: 123, description: 'test desc 1' }, { deviceId: 2, serialNumber: 567, description: 'test desc 2' }];
    },
  },
});

const propsDefault = {};

describe('SettingsDevicesOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
