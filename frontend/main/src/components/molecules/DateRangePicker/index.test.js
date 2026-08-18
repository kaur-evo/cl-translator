import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

const propsDefault = {
  modelValue: [],
  hideHeader: true,
  pickerDateMonth: '2024-01',
};

describe('DateRangePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:34:33'));

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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
});
