import { shallowMount } from '@vue/test-utils';

import TruncatedText from './index.vue';

describe('TruncatedText', () => {
  it('should render the text correctly', () => {
    const wrapper = shallowMount(TruncatedText, {
      propsData: {
        text: 'This is a sample text for testing',
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
