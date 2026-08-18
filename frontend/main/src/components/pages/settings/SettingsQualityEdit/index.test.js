import { mount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const router = {
  $router: {
    push: vi.fn(),
  },
};

const global = createGlobal({ router: { ...router } });

const createWrapper = (options) => mount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('SettingsQualityEdit', () => {
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
