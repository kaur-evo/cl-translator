import { shallowMount } from '@vue/test-utils';

import SettingsRemovedEntityView from './index.vue';

describe('SettingsRemovedEntityView', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsRemovedEntityView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsRemovedEntityView);
    expect(wrapper.element).toMatchSnapshot();
  });
});
