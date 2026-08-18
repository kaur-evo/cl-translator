import { shallowMount } from '@vue/test-utils';

import HeaderLabelValueRow from './index.vue';

const defaultProps = {
  large: false,
  label: 'Test Label',
  value: 'Test Value',
  labelClass: 'label-class',
  valueClass: 'value-class',
};

describe('HeaderLabelValueRow', () => {
  it('renders', () => {
    const wrapper = shallowMount(HeaderLabelValueRow, {
      propsData: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(HeaderLabelValueRow, {
      propsData: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in larger view', () => {
    const wrapper = shallowMount(HeaderLabelValueRow, {
      propsData: { ...defaultProps, large: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
