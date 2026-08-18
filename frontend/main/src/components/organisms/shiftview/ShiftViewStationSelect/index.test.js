import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewStationSelect from './index.vue';

import { useStationStore } from '@/stores/index';

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { id: 1, name: 'Test station' };
  stationStore.stations = [{ id: 1, name: 'Test station' }];

  return shallowMount(ShiftViewStationSelect, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  titleClass: 'title',
};

describe('ShiftViewStationSelect', () => {
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

  it('renders correctly when large is true', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, large: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
