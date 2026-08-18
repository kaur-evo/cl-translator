import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import index from './index.vue';
import mockData from './mockData';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  router: { $route: { full: vi.fn() } },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  collapsed: true,
  groups: [{ items: mockData }],
  activeKey: 'id',
  activeValue: '1',
  iconKey: 'string',
};

describe('SecondaryNavDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly on large screens', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.$vuetify.display.mdAndDown = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly on medium screens', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.$vuetify.display.mdAndDown = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
