import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      device: {
        screen: { width: 1920 },
      },
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  project: {},
  stats: { baselineData: [], currentData: [{ date: '2013-01-01' }] },
  actions: [],
  solutions: [],
};

describe('ImprovementsBarChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
