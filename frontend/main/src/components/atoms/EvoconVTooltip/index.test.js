import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  iconColor: 'string',
  type: 'string',
  title: 'string',
  rows: [
    {
      dotColor: 'primary',
      value: 'string',
      key: 'key2',
    },
    {
      value: 123,
      key: 'key3',
    },
    {
      value: 'a longer string value for tooltip row, it might be a bit longer than the others and even wrap to the next line',
      key: 'key1',
      allowTextWrap: true,
    },
  ],
};

describe('ShiftviewTooltip', () => {
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

  it('renders correctly with title icon', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        titleIcon: 'titleIcon',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
