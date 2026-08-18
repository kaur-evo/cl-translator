import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const route = {
  $route: {
    params: {},
  },
};

const global = createGlobal({
  piniaOptions: {
    initialState: {
      profile: {
        currentUser: undefined,
        highestUserRole: undefined,
      },
      improvementsProject: {
        projects: undefined,
      },
    },
  },
  router: { ...route },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('ImprovementProject', () => {
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
