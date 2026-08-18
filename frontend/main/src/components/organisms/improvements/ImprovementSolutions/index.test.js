import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementSolutions from './index.vue';

const defaultInitialState = {
  improvementsSolutions: {
    solutions: [],
  },
};

describe('ImprovementSolutions', () => {
  it('renders empty state correctly for user with edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementSolutions, {
      global: { plugins: [pinia] },
      props: {
        canEdit: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders empty state correctly for user without edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementSolutions, {
      global: { plugins: [pinia] },
      props: {
        canEdit: false,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
