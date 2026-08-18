import { shallowMount } from '@vue/test-utils';
import { mdiAccount, mdiAccountGroup } from '@mdi/js';

import EvoconVToggleButton from './index.vue';

const defaultProps = {
  items: [
    { icon: mdiAccount, text: 'Account' },
    { icon: mdiAccountGroup, text: 'Account Group' },
  ],
};

describe('EvoconVToggleButton', () => {
  it('renders', () => {
    const wrapper = shallowMount(EvoconVToggleButton, {
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(EvoconVToggleButton, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in compact version', () => {
    const wrapper = shallowMount(EvoconVToggleButton, {
      props: { ...defaultProps, isCompact: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
