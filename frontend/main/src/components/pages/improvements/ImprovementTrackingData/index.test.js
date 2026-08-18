import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementTrackingData from './index.vue';

import improvementsProjectApi from '@/api/improvementsProjectApi';
import improvementsStatsApi from '@/api/improvementsStatsApi';

vi.mock('@/api/improvementsProjectApi');
improvementsProjectApi.getProject = vi.fn();
improvementsProjectApi.saveProject = vi.fn();
vi.mock('@/api/improvementsStatsApi');
improvementsStatsApi.getCommentStats = vi.fn();

describe('ImprovementTrackingData', () => {
  const $route = {
    name: 'improvementTrackingData',
    meta: {
      formData: {
        factoryId: 2,
        stationIds: [],
        commentIds: [],
        productIds: [21, 22, 23],
        positionIds: [31, 32, 33],
      },
    },
  };

  test('that "formDataChanged" changes formData prop on specific keys', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        genericNotification: {},
        improvementsProject: {},
      },
    });
    const wrapper = shallowMount(ImprovementTrackingData, {
      global: {
        plugins: [pinia],
        stubs: ['router-link', 'router-view'],
        mocks: { $route },
      },
    });

    await flushPromises();
    const input = {
      stationIds: [123, 231],
      commentIds: [54, 52, 51],
      productIds: [],
    };
    await wrapper.vm.formDataChanged(input);
    expect(wrapper.vm.formData.factoryId).toBe(2);
    expect(wrapper.vm.formData.stationIds).toEqual([123, 231]);
    expect(wrapper.vm.formData.commentIds).toEqual([54, 52, 51]);
    expect(wrapper.vm.formData.productIds).toEqual([]);
    expect(wrapper.vm.formData.positionIds).toEqual([31, 32, 33]);
  });
});
