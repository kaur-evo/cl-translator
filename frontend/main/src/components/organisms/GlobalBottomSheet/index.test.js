import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GlobalBottomSheet from './index.vue';

describe('GlobalBottomSheet', () => {
  it('renders correctly', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        bottomSheet: {
          title: 'Test Title',
          component: { template: '<div />' },
          componentProps: { testProp: 'test-value' },
          theme: 'dark',
          height: 500,
        },
      },
    });

    const wrapper = shallowMount(GlobalBottomSheet, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
