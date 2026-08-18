import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewExtraSmallHeader from './index.vue';

import { useBottomSheetStore } from '@/stores/index';
import MobileShiftViewWidgetsDialog from '@/components/organisms/shiftview/MobileShiftViewWidgetsDialog/index.vue';

const createWrapper = (options = {}, pinia = createTestingPinia({ createSpy: vi.fn, initialState: { shift: { shift: { id: 1 } } } })) => shallowMount(ShiftViewExtraSmallHeader, {
  global: { plugins: [pinia] },
  ...options,
});

const propsDefault = {
  status: 'online',
};

describe('ShiftViewExtraSmallHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in portrait mode', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        shift: { shift: { id: 1 } },
        device: { screen: { width: 400, height: 800 } },
      },
    });
    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without shifts', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('dispatches openBottomSheet with correct payload when openWidgetsSheet is called', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);
    const bottomSheetStore = useBottomSheetStore(pinia);

    wrapper.vm.openWidgetsSheet();

    expect(bottomSheetStore.openBottomSheet).toHaveBeenCalledWith({
      component: MobileShiftViewWidgetsDialog,
    });
  });
});
