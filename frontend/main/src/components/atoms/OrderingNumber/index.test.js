import { mount } from '@vue/test-utils';

import OrderingNumber from './index.vue';

describe('OrderingNumber', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(OrderingNumber, {
      propsData: {
        number: 2,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly as small', () => {
    const wrapper = mount(OrderingNumber, {
      propsData: {
        number: 9,
        small: true,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly if color is white', () => {
    const wrapper = mount(OrderingNumber, {
      propsData: {
        number: 9,
        color: 'white',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly if color is given', () => {
    const wrapper = mount(OrderingNumber, {
      propsData: {
        number: 9,
        color: 'lw-orange',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly if number is bigger than 100', () => {
    const wrapper = mount(OrderingNumber, {
      propsData: {
        number: 999,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
