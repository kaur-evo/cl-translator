import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewWidgetsBottomSheet from './index.vue';

import {
  useShiftViewWidgetsStore,
} from '@/stores/index';

const createWrapper = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftViewWidgetsStore = useShiftViewWidgetsStore(pinia);
  shiftViewWidgetsStore.getActiveIndex = () => 0;
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

  return shallowMount(ShiftViewWidgetsBottomSheet, {
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewWidgetsBottomSheet', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
