import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { it } from 'vitest';

import TopReasonsSelection from './index';

import { useDeviceStore } from '@/stores/index';

const createWrapper = ({ props = {}, isMobileView = false } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  return shallowMount(TopReasonsSelection, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('TopReasonsSelection', () => {
  it('renders correctly', () => {
    const topReasons = [
      { entityId: 1, name: 'Reason 1' },
      { entityId: 2, name: 'Reason 2' },
      { entityId: 3, name: 'Reason 3' },
    ];
    const visibleReasons = [{ id: 1 }, { id: 2 }];
    const wrapper = createWrapper({ props: { topReasons, visibleReasons } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly on mobile view', () => {
    const topReasons = [
      { entityId: 1, name: 'Reason 1' },
      { entityId: 2, name: 'Reason 2' },
      { entityId: 3, name: 'Reason 3' },
    ];
    const visibleReasons = [{ id: 1 }, { id: 2 }];
    const wrapper = createWrapper({ props: { topReasons, visibleReasons }, isMobileView: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with no reasons', () => {
    const topReasons = [];
    const visibleReasons = [];
    const wrapper = createWrapper({ props: { topReasons, visibleReasons } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when topReasonsLoading is true', () => {
    const topReasons = [
      { entityId: 1, name: 'Reason 1' },
      { entityId: 2, name: 'Reason 2' },
    ];
    const visibleReasons = [{ id: 1 }];
    const wrapper = createWrapper({ props: { topReasons, visibleReasons, topReasonsLoading: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with selected reason', () => {
    const topReasons = [
      { entityId: 1, name: 'Reason 1' },
      { entityId: 2, name: 'Reason 2' },
    ];
    const visibleReasons = [{ id: 1 }];
    const wrapper = createWrapper({ props: { topReasons, visibleReasons, selectedReason: 2 } });
    expect(wrapper.element).toMatchSnapshot();
  });
});
