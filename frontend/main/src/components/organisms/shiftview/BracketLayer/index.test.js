import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BracketLayer from '@/components/organisms/shiftview/BracketLayer/index.vue';
import { useShiftviewSelectionStore } from '@/stores/index';

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.bracketRange = {};

  return shallowMount(BracketLayer, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  shiftHours: [],
};

describe('BracketLayer', () => {
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
