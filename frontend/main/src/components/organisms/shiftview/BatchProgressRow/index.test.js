import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BatchProgressRow from './index.vue';

import { useShiftviewTimelineStore, useUserPreferencesStore } from '@/stores/index';

const defaultCurrentBatch = {
  unitId: 'primaryUnit', alternativeUnitId: 'alternativeUnit', producedQty: 100, scrapQty: 10, plannedQty: 150, productId: 11,
};

const createWrapper = ({
  props = {},
  currentBatch = defaultCurrentBatch,
  viewSettings = { usePrimaryUnit: true },
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const timelineStore = useShiftviewTimelineStore(pinia);
  // currentBatch getter returns first value in batches Map
  timelineStore.batches = new Map([[currentBatch.id ?? 'current', currentBatch]]);

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = viewSettings;

  return shallowMount(BatchProgressRow, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('BatchProgressRow', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if progressType is bar', () => {
    const wrapper = createWrapper({ props: { progressType: 'bar' } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if progressType is circle', () => {
    const wrapper = createWrapper({ props: { progressType: 'circle' } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when plannedQty is 0', () => {
    const wrapper = createWrapper({
      currentBatch: {
        unitId: 'primaryUnit', alternativeUnitId: 'alternativeUnit', producedQty: 100, scrapQty: 10, plannedQty: 0, productId: 11,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isTargetReached', () => {
    it('is false when goodQty is below plannedQty', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.isTargetReached).toBe(false);
    });

    it('is true when goodQty exactly equals plannedQty', () => {
      const wrapper = createWrapper({
        currentBatch: {
          unitId: 'primaryUnit', alternativeUnitId: 'alternativeUnit', producedQty: 160, scrapQty: 10, plannedQty: 150, productId: 11,
        },
      });

      expect(wrapper.vm.isTargetReached).toBe(true);
    });

    it('is true when goodQty exceeds plannedQty', () => {
      const wrapper = createWrapper({
        currentBatch: {
          unitId: 'primaryUnit', alternativeUnitId: 'alternativeUnit', producedQty: 200, scrapQty: 10, plannedQty: 150, productId: 11,
        },
      });

      expect(wrapper.vm.isTargetReached).toBe(true);
    });

    it('is false when plannedQty is 0', () => {
      const wrapper = createWrapper({
        currentBatch: {
          unitId: 'primaryUnit', alternativeUnitId: 'alternativeUnit', producedQty: 100, scrapQty: 10, plannedQty: 0, productId: 11,
        },
      });

      expect(wrapper.vm.isTargetReached).toBe(false);
    });
  });
});
