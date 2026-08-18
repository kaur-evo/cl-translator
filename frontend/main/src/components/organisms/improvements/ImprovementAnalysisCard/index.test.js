import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementAnalysisCard from './index.vue';

describe('ImprovementAnalysisCard', () => {
  it('renders empty state correctly for user with edit rights', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        improvementsAnalysis: { project5Whys: [] },
      },
    });
    const wrapper = shallowMount(ImprovementAnalysisCard, {
      global: { plugins: [pinia] },
      props: {
        canEdit: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders empty state correctly for user without edit rights', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        improvementsAnalysis: { project5Whys: [] },
      },
    });
    const wrapper = shallowMount(ImprovementAnalysisCard, {
      global: { plugins: [pinia] },
      props: {
        canEdit: false,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
