import { shallowMount } from '@vue/test-utils';

import SmallPlaceholderText from './index.vue';

const propsDefault = {
  primaryText: 'Primary text',
  secondaryText: 'Secondary text that is somewhat longer',
};

describe('SmallPlaceholderText', () => {
  it('renders', () => {
    const wrapper = shallowMount(SmallPlaceholderText, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SmallPlaceholderText, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
