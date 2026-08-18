import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import WidgetHolder from './index.vue';

import { useShiftViewWidgetsStore } from '@/stores/index';
import ShiftViewWidgetsBottomSheet from '@/components/organisms/shiftview/ShiftViewWidgetsBottomSheet/index.vue';
import useBottomSheetStore from '@/stores/bottomSheet';

const mountWithPlugins = (props = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const shiftViewWidgetsStore = useShiftViewWidgetsStore(pinia);
  vi.spyOn(shiftViewWidgetsStore, 'getActiveIndex', 'get').mockReturnValue(() => 0);
  shiftViewWidgetsStore.widgetsList = [{
    name: 'performance',
    component: 'performance-widget',
    type: 'perform',
    config: '{"subType":"SECOND_PER_SIGNAL"}',
  }, {
    name: 'OEE',
    component: 'OEE-widget',
    type: 'oee',
    config: '{}',
  }];

  const wrapper = shallowMount(WidgetHolder, {
    props,
    global: { plugins: [pinia] },
  });
  return { wrapper, pinia };
};

describe('WidgetHolder', () => {
  it('renders correctly', () => {
    const { wrapper } = mountWithPlugins();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with large prop', () => {
    const { wrapper } = mountWithPlugins({ large: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if openInBottomSheet prop is true', () => {
    const { wrapper } = mountWithPlugins({ openInBottomSheet: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if loading prop is true', () => {
    const { wrapper } = mountWithPlugins({ loading: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('calls bottomSheet openBottomSheet with correct payload when openWidgetsSheet is called', () => {
    const { wrapper, pinia } = mountWithPlugins({ openInBottomSheet: true, widgetKey: 2 });
    const bottomSheetStore = useBottomSheetStore(pinia);

    wrapper.vm.openWidgetsSheet();

    expect(bottomSheetStore.openBottomSheet).toHaveBeenCalledWith({
      component: ShiftViewWidgetsBottomSheet,
      componentProps: { widgetKey: 2 },
      title: 'Metrics',
      height: 360,
    });
  });

  describe('paddingClass', () => {
    it('returns empty string when loading is true', () => {
      const { wrapper } = mountWithPlugins({ loading: true });
      expect(wrapper.vm.paddingClass).toBe('');
    });

    it('returns "pa-4" when loading is false and large is true', () => {
      const { wrapper } = mountWithPlugins({ loading: false, large: true });
      expect(wrapper.vm.paddingClass).toBe('pa-4');
    });

    it('returns "pa-2" when loading is false and large is false', () => {
      const { wrapper } = mountWithPlugins({ loading: false, large: false });
      expect(wrapper.vm.paddingClass).toBe('pa-2');
    });
  });
});
