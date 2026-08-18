import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GlobalGenericDialog from './index.vue';

import useGenericDialogStore from '@/stores/genericDialog';

const defaultInitialState = {
  genericDialog: {
    isOpen: true,
    title: 'title',
    text: 'text',
    cancelText: 'cancelText',
    confirmText: 'confirmText',
    width: 500,
    color: 'primary',
    component: () => '',
    persistent: true,
    allowFullscreen: true,
  },
};

describe('GlobalGenericDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(GlobalGenericDialog, {
      global: { plugins: [createTestingPinia({ initialState: defaultInitialState })] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(GlobalGenericDialog, {
      global: { plugins: [createTestingPinia({ initialState: defaultInitialState })] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should set isOpen to false on route change when not persistent', () => {
    const wrapper = shallowMount(GlobalGenericDialog, {
      global: {
        plugins: [createTestingPinia({
          initialState: { genericDialog: { ...defaultInitialState.genericDialog, persistent: false, isOpen: true } },
          stubActions: false,
        })],
        mocks: { $route: { path: '/initial' } },
      },
    });

    wrapper.vm.$options.watch.$route.call(wrapper.vm);

    expect(useGenericDialogStore().isOpen).toBe(false);
  });

  it('should not set isOpen to false on route change when persistent', () => {
    const wrapper = shallowMount(GlobalGenericDialog, {
      global: {
        plugins: [createTestingPinia({
          initialState: { genericDialog: { ...defaultInitialState.genericDialog, persistent: true, isOpen: true } },
        })],
        mocks: { $route: { path: '/initial' } },
      },
    });

    wrapper.vm.$options.watch.$route.call(wrapper.vm);

    expect(useGenericDialogStore().isOpen).toBe(true);
  });
});
