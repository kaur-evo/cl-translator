import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementProjectChartSection from './index.vue';

describe('ImprovementProjectChartSection', () => {
  it('renders empty state correctly', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        comment: {
          commentsList: [{ id: 1, name: 'test comment' }],
        },
      },
    });
    const wrapper = shallowMount(ImprovementProjectChartSection, {
      global: { plugins: [pinia] },
      props: {
        isTrackingDataAdded: true,
        project: {
          type: 'REDUCE_TO_TIME', commentIds: [1], baselineStartDate: '2021-12-12T00:00:00', baselineEndDate: '2021-12-19T00:00:00', startDate: '2021-12-20T00:00:00', endDate: '2021-12-27T00:00:00',
        },
        stats: { currentData: [] },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
