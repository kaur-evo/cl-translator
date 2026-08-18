import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

vi.mock('@/helpers/d3Helpers', async () => {
  const actual = await vi.importActual('@/helpers/d3Helpers');
  return {
    ...actual,
    getTextWidth: vi.fn(() => 8),
  };
});

const propsDefault = {
  modelValue: 'Test',
  type: 'text',
  prefix: '',
};

const createWrapper = (isMobileView = false, props = propsDefault) => shallowMount(index, {
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: { device: { screen: { width: isMobileView ? 400 : 1200, height: 800 } } },
    })],
  },
  props,
});

describe('EvoconVInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as a chip', () => {
    const wrapper = createWrapper(false, { ...propsDefault, useChip: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as a chip without value', () => {
    const wrapper = createWrapper(false, { ...propsDefault, useChip: true, modelValue: null });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if input is not filled and should be truncated', () => {
    const wrapper = createWrapper(false, { ...propsDefault, filled: false, truncateInput: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if icon is activated', () => {
    const wrapper = createWrapper(false, { ...propsDefault, isIconActivated: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if icon is rotated by 270 deg', () => {
    const wrapper = createWrapper(false, { ...propsDefault, isIconRotated: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper(true, { ...propsDefault, isIconRotated: true });
    expect(wrapper.element).toMatchSnapshot();
  });
});
