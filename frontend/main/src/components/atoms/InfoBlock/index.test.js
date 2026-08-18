import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import InfoBlock from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(InfoBlock, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  header: 'Card header',
  body: 'Card body',
  icon: 'Info icon',
  color: '#905DD0',
};

describe('InfoBlock', () => {
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

  it('renders correctly as collapsible', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, collapsible: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if body is truncated and collapsed', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, collapsible: true, body: 'first line \n second line' },
    });

    await wrapper.setData({ isBodyTruncated: true, isCollapsed: true });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if body is truncated and its not collapsed', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, collapsible: true, body: 'first line\nsecond line' },
    });

    await wrapper.setData({ isBodyTruncated: true, isCollapsed: false });
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
