import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    genericDialog: { allowFullscreen: true },
    ...overrides,
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

const propsDefault = {
  title: 'string',
  titleIcon: 'string',
  color: 'string',
  iconColor: 'string',
};

describe('DialogTemplate', () => {
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
