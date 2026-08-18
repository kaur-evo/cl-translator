import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MobileShiftStatsRow from './index.vue';

import { useShiftviewTimelineStore } from '@/stores/index';

const createPinia = ({ currentBatch } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.currentBatch = currentBatch;
  return pinia;
};

describe('MobileShiftStatsRow', () => {
  it('renders correctly without order', () => {
    const wrapper = shallowMount(MobileShiftStatsRow, {
      global: {
        plugins: [createPinia({
          currentBatch: {
            productionOrder: null,
            productName: 'test product',
            productSku: 'SKU-123',
          },
        })],
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with order', () => {
    const wrapper = shallowMount(MobileShiftStatsRow, {
      global: {
        plugins: [createPinia({
          currentBatch: {
            productionOrder: '12345',
            productName: 'test product',
            productSku: 'SKU-123',
          },
        })],
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
