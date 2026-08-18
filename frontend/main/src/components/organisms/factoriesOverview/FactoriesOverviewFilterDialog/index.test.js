import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { REALTIME } from '@/constants/routeNames';
import { useFactoryOverviewConfigStore, useGenericDialogStore } from '@/stores';

describe('FactoriesOverviewFilterDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { 'dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('sets data correctly on mounted', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        factoryOverviewConfig: {
          timelinesInterval: 1,
          timelinesStatColumn: 'availability',
          unitType: 'alternative',
          statusFilter: ['uncommented'],
        },
      },
    });

    const wrapper = shallowMount(index, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.stat).toBe('availability');
    expect(wrapper.vm.interval).toBe(1);
    expect(wrapper.vm.unit).toBe('alternative');
    expect(wrapper.vm.statuses).toEqual(['uncommented']);
  });

  test('that onSave calls all expected methods', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        factoryOverviewConfig: {
          timelinesInterval: 1,
          timelinesStatColumn: 'availability',
          unitType: 'alternative',
          statusFilter: ['uncommented'],
        },
      },
    });

    const wrapper = shallowMount(index, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: { name: REALTIME },
        },
      },
    });

    const factoryOverviewConfigStore = useFactoryOverviewConfigStore();
    const genericDialogStore = useGenericDialogStore();

    wrapper.vm.stations = [1, 2, 7];
    wrapper.vm.stat = 'performance';
    wrapper.vm.interval = 2;
    wrapper.vm.unit = 'primary';
    wrapper.vm.statuses = ['slowproduction'];

    await wrapper.vm.onSave();

    expect(factoryOverviewConfigStore.modifyFactoryViewStationOrdering).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.modifyFactoryViewStationOrdering).toHaveBeenCalledWith([1, 2, 7]);
    expect(factoryOverviewConfigStore.setTimelinesStatColumn).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.setTimelinesStatColumn).toHaveBeenCalledWith('performance');
    expect(factoryOverviewConfigStore.setTimelinesInterval).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.setTimelinesInterval).toHaveBeenCalledWith(2);
    expect(factoryOverviewConfigStore.setUnitType).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.setUnitType).toHaveBeenCalledWith('primary');
    expect(factoryOverviewConfigStore.setStatusFilter).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.setStatusFilter).toHaveBeenCalledWith(['slowproduction']);
    expect(factoryOverviewConfigStore.saveFactoryOverviewConfig).toHaveBeenCalledTimes(1);
    expect(factoryOverviewConfigStore.subscribeToFactoryViewStations).toHaveBeenCalledTimes(1);
    expect(genericDialogStore.closeDialog).toHaveBeenCalledTimes(1);
  });
});
