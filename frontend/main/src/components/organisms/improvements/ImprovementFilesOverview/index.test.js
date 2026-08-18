import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementFilesOverview from './index.vue';

const defaultInitialState = {
  improvementsFile: {
    files: [],
  },
};

describe('ImprovementFilesOverview', () => {
  it('renders empty state correctly for user with edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementFilesOverview, {
      global: { plugins: [pinia] },
      props: {
        canEdit: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders empty state correctly for user without edit rights', () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementFilesOverview, {
      global: { plugins: [pinia] },
      props: {
        canEdit: false,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
