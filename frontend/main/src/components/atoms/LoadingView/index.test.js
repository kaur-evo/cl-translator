import { shallowMount } from '@vue/test-utils';

import LoadingView from './index.vue';

const createWrapper = (options) => shallowMount(LoadingView, {
  ...options,
  mixins: [{
    methods: {
      getImgUrl: vi.fn(() => 'mock-url'),
    },
  }],
});

describe('LoadingView', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });
});
