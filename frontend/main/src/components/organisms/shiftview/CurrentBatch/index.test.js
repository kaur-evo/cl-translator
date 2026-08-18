import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CurrentBatch from './index.vue';

import { useShiftviewTimelineStore, useShiftStore } from '@/stores/index';

const defaultCurrentBatch = { estimatedTimeLeft: 970, productionOrder: 'test-123' };
const defaultShift = { shiftDate: '2024-06-01' };

const createWrapper = ({
  props = {},
  currentBatch = defaultCurrentBatch,
  shift = defaultShift,
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.batches = new Map([[currentBatch.id ?? 'current', currentBatch]]);

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = shift;

  return shallowMount(CurrentBatch, {
    props,
    global: {
      plugins: [pinia],
      stubs: {
        'v-tooltip': false,
        'v-overlay': false,
      },
    },
  });
};

describe('CurrentBatch', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without estimated time and production order', () => {
    const wrapper = createWrapper({
      currentBatch: { estimatedTimeLeft: null, productionOrder: null },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
