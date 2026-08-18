import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import DeleteButton from './index.vue';

describe('DeleteButton', () => {
  it('renders correctly when isMobile is false', () => {
    const wrapper = shallowMount(DeleteButton, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: { device: { screen: { width: 1200, height: 800 } } },
        })],
        mocks: { $t: (msg) => msg },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when isMobile is true', () => {
    const wrapper = shallowMount(DeleteButton, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: { device: { screen: { width: 400, height: 800 } } },
        })],
        mocks: { $t: (msg) => msg },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
