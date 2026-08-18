import { shallowMount } from '@vue/test-utils';

import TextWithUrl from './index.vue';

describe('TextHighlight', () => {
  it('renders correctly without url', () => {
    const wrapper = shallowMount(TextWithUrl, {
      props: {
        text: 'string',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with url', () => {
    const wrapper = shallowMount(TextWithUrl, {
      props: {
        text: 'this link https://evocon.com/how-evocon-works/ describes how evocon works',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with multiple urls', () => {
    const wrapper = shallowMount(TextWithUrl, {
      props: {
        text: 'this link https://evocon.com/how-evocon-works/ describes how evocon works and this one https://evocon.com/oee-software-roi-calculator/ has roi calculator',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with <p> tag', () => {
    const wrapper = shallowMount(TextWithUrl, {
      props: {
        tag: 'p',
        text: 'this link https://evocon.com/how-evocon-works/ describes how evocon works',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
