import { mount } from '@vue/test-utils';

import SingleSelectList from './index.vue';

describe('SingleSelectList', () => {
  it('renders correctly', () => {
    const wrapper = mount(SingleSelectList, {
      stubs: ['v-lazy'],

      props: {
        items: [{ name: '123' }, { name: '231' }, { name: '321' }, { name: '132' }],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
