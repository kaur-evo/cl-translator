import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementsFilterBar from './index.vue';

const pinia = createTestingPinia({
  initialState: {
    profile: {
      currentUser: { firstDayOfWeek: 1 },
    },
  },
});

describe('ImprovementsFilterBar', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ImprovementsFilterBar, {
      global: { plugins: [pinia] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
