import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementProjectsTable from './index.vue';

const pinia = createTestingPinia();

describe('ImprovementProjectChartSection', () => {
  it('renders empty state correctly', () => {
    const wrapper = shallowMount(ImprovementProjectsTable, {
      props: {
        projects: [],
        loading: false,
        isFiltered: false,
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
