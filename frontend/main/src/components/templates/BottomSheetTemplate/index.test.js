import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BottomSheetTemplate from './index.vue';

const defaultProps = {
  height: 400,
};

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    bottomSheet: { isOpen: true },
  },
});

describe('BottomSheetTemplate', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(BottomSheetTemplate, {
      global: { plugins: [createPinia()] },
      props: defaultProps,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders default slot content', () => {
    const wrapper = shallowMount(BottomSheetTemplate, {
      global: { plugins: [createPinia()] },
      props: defaultProps,
      slots: { default: '<div class="test-content">Body</div>' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
