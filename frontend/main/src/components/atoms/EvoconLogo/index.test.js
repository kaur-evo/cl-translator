import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('EvoconLogo', () => {
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

  it('renders correctly in mobile view', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
