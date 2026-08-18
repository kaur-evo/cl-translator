import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewSmallHeader from './index.vue';

import { useBottomSheetStore } from '@/stores/index';
import deviceStatus from '@/constants/deviceStatus';

const defaultProps = {
  status: deviceStatus.ONLINE,
};

const createWrapper = (options = {}, pinia = createTestingPinia({ createSpy: vi.fn, initialState: { shift: { shift: { id: 1 } } } })) => shallowMount(ShiftViewSmallHeader, {
  global: { plugins: [pinia] },
  props: { ...defaultProps },
  ...options,
});

describe('ShiftViewSmallHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without shifts', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({}, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that openWidgetsSheet calls openBottomSheet with widgets component config', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({}, pinia);
    const bottomSheetStore = useBottomSheetStore(pinia);

    wrapper.vm.openWidgetsSheet();

    expect(bottomSheetStore.openBottomSheet).toHaveBeenCalledWith(expect.objectContaining({
      componentProps: { widgetKey: 0 },
      height: 360,
    }));
  });

  test('that onExpandBatchOverview calls openBottomSheet with batches component config', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({}, pinia);
    const bottomSheetStore = useBottomSheetStore(pinia);

    wrapper.vm.onExpandBatchOverview('completed');

    expect(bottomSheetStore.openBottomSheet).toHaveBeenCalledWith(expect.objectContaining({
      componentProps: { tab: 'completed' },
      theme: 'light',
    }));
  });
});
