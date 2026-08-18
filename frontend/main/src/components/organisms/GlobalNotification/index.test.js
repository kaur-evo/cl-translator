import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const defaultInitialState = {
  genericNotification: {
    isOpen: true,
    text: 'text',
    timeout: 5000,
    type: '',
    secondaryText: '',
  },
};

const createWrapper = (initialState = defaultInitialState) => shallowMount(index, {
  global: { plugins: [createTestingPinia({ initialState })] },
});

describe('GlobalNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if type is "success"', () => {
    const wrapper = createWrapper({
      genericNotification: { ...defaultInitialState.genericNotification, type: 'success' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is "warning"', () => {
    const wrapper = createWrapper({
      genericNotification: { ...defaultInitialState.genericNotification, type: 'warning' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is "error"', () => {
    const wrapper = createWrapper({
      genericNotification: { ...defaultInitialState.genericNotification, type: 'error' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
