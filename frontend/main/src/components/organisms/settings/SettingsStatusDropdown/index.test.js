import { shallowMount } from '@vue/test-utils';

import SettingsStatusDropdown from './index.vue';

const createWrapper = (options) => shallowMount(SettingsStatusDropdown, {
  ...options,
});

const propsDefault = {
  status: true,
};

describe('SettingsStatusDropdown', () => {
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
