import { shallowMount } from '@vue/test-utils';

import ListItemSubtitleContent from './index.vue';

const propsDefault = {
  title: 'Title',
  primaryValue: 'primaryVal',
  secondaryValue: 'secondaryVal',
  tertiaryValue: 'tertiaryVal',
};

describe('ListItemSubtitleContent', () => {
  it('renders', () => {
    const wrapper = shallowMount(ListItemSubtitleContent, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ListItemSubtitleContent, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with multiple lines', () => {
    const wrapper = shallowMount(ListItemSubtitleContent, {
      props: { ...propsDefault, secondaryValue: '', allowMultipleLines: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when primaryValue is array', () => {
    const wrapper = shallowMount(ListItemSubtitleContent, {
      props: { ...propsDefault, primaryValue: ['Descr', 'value1', 'value2.1, value2.2'] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('primaryValueAsArray', () => {
    it('returns array when primaryValue is array', () => {
      const wrapper = shallowMount(ListItemSubtitleContent, {
        props: { ...propsDefault, primaryValue: ['Descr', 'value1', 'value2.1, value2.2'] },
      });

      expect(wrapper.vm.primaryValueAsArray).toEqual(['Descr', 'value1', 'value2.1, value2.2']);
    });

    it('returns array with single item when primaryValue is string', () => {
      const wrapper = shallowMount(ListItemSubtitleContent, {
        props: { ...propsDefault, primaryValue: 'single string' },
      });

      expect(wrapper.vm.primaryValueAsArray).toEqual(['single string']);
    });
  });
});
