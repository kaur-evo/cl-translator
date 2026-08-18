import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  i: 'string',
  graphData: [],
  updateTrigger: 0,
  tooltipHTMLFunc: (val) => val || {},
};

describe('OeeHorizontalGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });
});
