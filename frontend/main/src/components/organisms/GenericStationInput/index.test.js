import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    station: {
      stationGroups: [{ id: 1, name: 'testGroup1' }, { id: 2, name: 'testGroup2' }],
      stations: [{ id: 11, name: 'station 1', groupId: 1 }, { id: 12, name: 'station 2', groupId: 2 }],
      ...overrides,
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [createPinia()],
  },
  ...options,
});

const propsDefault = {
  modelValue: [],
  groupsOverride: null,
  itemsOverride: null,
};

describe('GenericStationInput', () => {
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
