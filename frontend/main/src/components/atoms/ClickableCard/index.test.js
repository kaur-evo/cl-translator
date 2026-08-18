import { shallowMount } from '@vue/test-utils';

import ClickableCard from './index.vue';

const defaultProps = {
  title: 'Card title',
  content: ['Card content', 'text'],
  btnText: 'Button text',
};

describe('ClickableCard', () => {
  it('renders', () => {
    const wrapper = shallowMount(ClickableCard, {
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ClickableCard, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
