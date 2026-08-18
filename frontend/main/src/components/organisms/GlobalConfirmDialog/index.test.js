import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GlobalConfirmDialog from './index.vue';

const defaultInitialState = {
  confirmDialog: {
    isOpen: true,
    title: 'title',
    text: 'text',
    cancelText: 'cancelText',
    confirmText: 'confirmText',
    width: 500,
    color: 'primary',
  },
};

describe('GlobalConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(GlobalConfirmDialog, {
      global: { plugins: [createTestingPinia({ initialState: defaultInitialState })] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(GlobalConfirmDialog, {
      global: { plugins: [createTestingPinia({ initialState: defaultInitialState })] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that primaryButtonType returns "primary" if color is "primary"', () => {
    const wrapper = shallowMount(GlobalConfirmDialog, {
      global: { plugins: [createTestingPinia({ initialState: defaultInitialState })] },
    });

    expect(wrapper.vm.primaryButtonType).toBe('primary');
  });

  test('that primaryButtonType returns "secondary" if color is "error"', () => {
    const wrapper = shallowMount(GlobalConfirmDialog, {
      global: {
        plugins: [createTestingPinia({
          initialState: { confirmDialog: { ...defaultInitialState.confirmDialog, color: 'error' } },
        })],
      },
    });

    expect(wrapper.vm.primaryButtonType).toBe('secondary');
  });
});
