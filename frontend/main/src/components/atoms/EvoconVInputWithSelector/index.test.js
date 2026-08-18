import { shallowMount } from '@vue/test-utils';

import EvoconVInputWithSelector from './index.vue';

vi.mock('@/helpers/d3Helpers', async () => {
  const actual = await vi.importActual('@/helpers/d3Helpers');
  return {
    ...actual,
    getTextWidth: vi.fn(() => 8),
  };
});

const createWrapper = (options) => shallowMount(EvoconVInputWithSelector, {
  ...options,
});

const propsDefault = {
  items: ['first', 'second'],
  modelValue: 'text',
  selectedItem: 'second',
};

describe('EvoconVInputWithSelector', () => {
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

  it('renders correctly with single item', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: ['second'] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with number type', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, modelValue: 123, type: 'number' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
