import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewEvoconLogoBtn from './index.vue';

const createWrapper = (options = {}) => shallowMount(ShiftViewEvoconLogoBtn, {
  global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
  ...options,
});

describe('ShiftViewEvoconLogoBtn', () => {
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

  it('renders correctly when large prop is true', () => {
    const wrapper = createWrapper({ props: { large: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
