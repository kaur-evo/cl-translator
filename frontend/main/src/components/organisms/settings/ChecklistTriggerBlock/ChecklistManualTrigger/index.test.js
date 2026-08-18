import { shallowMount } from '@vue/test-utils';

import ChecklistManualTrigger from './index.vue';

describe('ChecklistManualTrigger', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ChecklistManualTrigger);

    expect(wrapper.element).toMatchSnapshot();
  });
});
