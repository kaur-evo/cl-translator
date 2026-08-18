import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BatchOverviewDialog from './index.vue';

const defaultPiniaState = {
  genericDialog: {
    dialogData: { tab: 'completed' },
  },
  device: {
    showFullscreenDialogs: false,
  },
};

const createWrapper = (piniaStateOverrides = {}) => shallowMount(BatchOverviewDialog, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: { ...defaultPiniaState, ...piniaStateOverrides },
      }),
    ],
  },
});

describe('BatchOverviewDialog', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
