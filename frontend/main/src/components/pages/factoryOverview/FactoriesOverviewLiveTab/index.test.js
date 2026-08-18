import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import FactoriesOverviewLiveTab from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { useFactoryOverviewConfigStore, useDeviceStore } from '@/stores';

window.factoryViewLiveCentrifugeService = {
  unsubscribeFactoryViewStations: vi.fn(),
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      factoryOverviewConfig: {},
      device: {
        isBrowserTabActive: true,
      },
      profile: {
        currentUser: { tenantId: 1 },
      },
      ...overrides,
    },
  });

  const factoryOverviewConfigStore = useFactoryOverviewConfigStore(pinia);
  factoryOverviewConfigStore.filteredFactoryOverviewStations = [];

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;

  return pinia;
};

describe('FactoriesOverviewLiveTab', () => {
  vi.useFakeTimers();
  it('renders correctly', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewLiveTab, {
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that interval is set on mount', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewLiveTab, {
      global: { plugins: [pinia] },

    });

    expect(wrapper.vm.qtyInterval).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.qtyInterval.cbFun).toBe(wrapper.vm.toggleQuantityElementVisibility);
    expect(wrapper.vm.qtyInterval.delay).toBe(15000);
    const spy = vi.spyOn(wrapper.vm.qtyInterval, 'cbFun');
    const intervalsPassed = 3;
    vi.advanceTimersByTime(intervalsPassed * 15000);
    expect(spy).toHaveBeenCalledTimes(intervalsPassed);
  });

  test('that interval is cleared on unmount', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewLiveTab, {
      global: { plugins: [pinia] },
    });

    const spy = vi.spyOn(wrapper.vm.qtyInterval, 'cbFun');
    wrapper.unmount();
    expect(wrapper.vm.qtyInterval).toBe(null);
    const intervalsPassed = 3;
    vi.advanceTimersByTime(intervalsPassed * 15000);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
