import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

const propsDefault = {
  title: 'string',
  disabled: false,
};

describe('HeaderBlockButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when large prop is true', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, large: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
