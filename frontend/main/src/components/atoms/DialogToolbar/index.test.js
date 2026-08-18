import { shallowMount } from '@vue/test-utils';

import DialogToolbar from './index.vue';

const propsDefault = {
  title: 'string',
  titleIcon: 'string',
  color: 'string',
  iconColor: 'string',
  subtitle: 'string',
};

describe('DialogToolbar', () => {
  it('renders', () => {
    const wrapper = shallowMount(DialogToolbar, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(DialogToolbar, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without titleIcon and subtitle', () => {
    const wrapper = shallowMount(DialogToolbar, {
      props: { ...propsDefault, titleIcon: '', subtitle: '' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with titleIcon, but without subtitle', () => {
    const wrapper = shallowMount(DialogToolbar, {
      props: { ...propsDefault, subtitle: '' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly witout titleIcon, but with subtitle', () => {
    const wrapper = shallowMount(DialogToolbar, {
      props: { ...propsDefault, titleIcon: '' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
