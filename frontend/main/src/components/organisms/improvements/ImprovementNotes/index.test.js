import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementNotes from './index.vue';

const defaultInitialState = {
  improvementsNote: {
    notes: [],
  },
};

describe('ImprovementNotes', () => {
  it('renders empty state correctly for user with edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementNotes, {

      global: { plugins: [pinia] },

      props: {
        canEdit: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders empty state correctly for user without edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementNotes, {
      global: { plugins: [pinia] },
      props: {
        canEdit: false,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
