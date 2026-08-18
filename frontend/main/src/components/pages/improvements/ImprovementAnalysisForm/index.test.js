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
    params: vi.fn(),
  },
};

const global = createGlobal({
  piniaOptions: {
    initialState: {
      improvementsAnalysis: { project5Whys: {} },
      improvementsSolutions: {},
    },
  },
  router: { router, route },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('ImprovementAnalysisForm', () => {
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
