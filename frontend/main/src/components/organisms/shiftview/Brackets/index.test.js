import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import Brackets from './index.vue';

import {
  useShiftviewSelectionStore,
  useShiftStore,
  useStationStore,
} from '@/stores/index';

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.bracketRange = { startTime: '2020-01-01T00:00:00Z', endTime: '2020-02-01T00:00:00Z' };
  shiftviewSelectionStore.shiftviewSelectionType = null;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { startTime: '2020-01-01T00:00:00Z', endTime: '2020-02-01T00:00:00Z' };

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  return shallowMount(Brackets, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  shiftHours: [{ dateTime: '2020-02-02T12:00:00' }],
};

describe('Brackets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
