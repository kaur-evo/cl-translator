import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ResponsiveConditionBlock from './index.vue';

describe('ResponsiveConditionBlock', () => {
  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(ResponsiveConditionBlock, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: { device: { screen: { width: 400, height: 800 } } },
        })],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in not mobile view', () => {
    const wrapper = shallowMount(ResponsiveConditionBlock, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: { device: { screen: { width: 1200, height: 800 } } },
        })],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
