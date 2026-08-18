import { shallowMount } from '@vue/test-utils';

import EvoconVTextarea from './index.vue';

const createWrapper = (options) => shallowMount(EvoconVTextarea, {
  ...options,
});

const propsDefault = {
  maxLength: '200',
};

describe('EvoconVTextarea', () => {
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
