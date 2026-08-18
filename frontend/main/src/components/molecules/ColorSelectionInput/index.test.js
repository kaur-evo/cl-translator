import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

const createWrapper = (options) => shallowMount(index, {
  ...options,
});

describe('ColorSelectionInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders', () => {
    const wrapper = createWrapper({
      props: { modelValue: '#FA8072', hint: 'Select color' },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.element).toMatchSnapshot();
  });
});
