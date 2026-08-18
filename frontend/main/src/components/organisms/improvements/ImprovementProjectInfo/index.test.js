import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementProjectInfo from './index.vue';

import { useProductStore } from '@/stores/index';

describe('ImprovementProjectInfo', () => {
  test('that filteredProducts has only products that are in some of the projects stations', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        comment: {
          allComments: [],
          commentsMap: {},
          commentGroupsMap: [{}],
        },
        station: {
          stations: [],
        },
        product: {
          products: [
            { id: 1, stationIds: [1] }, { id: 2, stationIds: [1, 2] }, { id: 3, stationIds: [3, 4] }, { id: 4, stationIds: [4] }, { id: 5, stationIds: [5, 9] },
          ],
          productsMap: {},
        },
      },
    });
    const productStore = useProductStore(pinia);
    productStore.fetchProducts = vi.fn();
    const wrapper = shallowMount(ImprovementProjectInfo, {
      global: { plugins: [pinia] },
      props: {
        project: {
          stationIds: [3, 5],
          productIds: [],
          users: [],
        },
      },
    });

    expect(wrapper.vm.filteredProducts.length).toBe(2);
    expect(wrapper.vm.filteredProducts[0].id).toBe(3);
    expect(wrapper.vm.filteredProducts[1].id).toBe(5);
  });
});
