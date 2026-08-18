import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MobileShiftViewWidgetsDialog from './index.vue';

import { useShiftViewWidgetsStore } from '@/stores/index';

const createWrapper = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftViewWidgetsStore = useShiftViewWidgetsStore(pinia);
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
  shiftViewWidgetsStore.getActiveIndex = () => 0;

  return shallowMount(MobileShiftViewWidgetsDialog, {
    global: { plugins: [pinia] },
  });
};

describe('MobileShiftViewWidgetsDialog', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
