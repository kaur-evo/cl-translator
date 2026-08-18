import { shallowMount } from '@vue/test-utils';

import EvoconVRadio from './index.vue';

describe('EvoconVRadio', () => {
  it('renders correctly when selected', () => {
    const wrapper = shallowMount(EvoconVRadio, {
      props: {
        value: true,
        label: 'label',
        subLabel: 'subLabel',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when not selected', () => {
    const wrapper = shallowMount(EvoconVRadio, {
      props: {
        value: false,
        label: 'label',
        subLabel: 'subLabel',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
