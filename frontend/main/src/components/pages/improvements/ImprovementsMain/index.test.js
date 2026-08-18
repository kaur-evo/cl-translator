import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const router = {
  $router: {
    push: vi.fn(),
  },
};
const route = {
  $route: {
    name: 'improvements',
  },
};

const global = createGlobal({ router: { ...router, ...route } });

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('ImprovementsOverview', () => {
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
