import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import StationSelectDialog from './index.vue';

import {
  useProfileStore,
  useStationStore,
  useFactoryStore,
  useDeviceStore,
} from '@/stores/index';

const defaultStationsMap = {
  1: {
    id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
  },
  2: {
    id: 2, name: 'Station 2', factoryId: 11, groupId: 21,
  },
  3: {
    id: 3, name: 'Station 3', factoryId: 12, groupId: 22,
  },
};

const defaultStations = [{
  id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
}, {
  id: 2, name: 'Station 2', factoryId: 11, groupId: 21,
}, {
  id: 3, name: 'Station 3', factoryId: 12, groupId: 22,
}];

const defaultStationGroups = [{ id: 21, name: 'Station group1', factoryId: 11 }, { id: 22, name: 'Station group2', factoryId: 12 }];
const defaultStationGroupsMap = { 21: { id: 21, name: 'Station group1', factoryId: 11 }, 22: { id: 22, name: 'Station group2', factoryId: 12 } };

const defaultFactoriesMap = {
  11: { id: 11, name: 'Factory 1', stations: [{ id: 1, name: 'Station 1', factoryId: 11 }, { id: 2, name: 'Station 2', factoryId: 11 }] },
  12: { id: 12, name: 'Factory 2', stations: [{ id: 3, name: 'Station 3', factoryId: 12 }] },
};

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const profileStore = useProfileStore(pinia);
  profileStore.currentUser = storeOverrides.currentUser ?? { defaultStationId: 1 };

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 1 };
  stationStore.stationsMap = storeOverrides.stationsMap ?? defaultStationsMap;
  stationStore.stations = storeOverrides.stations ?? defaultStations;
  stationStore.stationGroups = storeOverrides.stationGroups ?? defaultStationGroups;
  stationStore.stationGroupsMap = storeOverrides.stationGroupsMap ?? defaultStationGroupsMap;

  const factoryStore = useFactoryStore(pinia);
  factoryStore.factoriesMap = storeOverrides.factoriesMap ?? defaultFactoriesMap;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const wrapper = shallowMount(StationSelectDialog, {
    global: { plugins: [pinia] },
  });
  return { wrapper, stores: { profileStore, stationStore, factoryStore, deviceStore }, pinia };
};

describe('StationSelectDialog', () => {
  it('renders', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if there are multiple factories', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if there is only one factory', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        stationsMap: { 1: { id: 1, name: 'Station 1', factoryId: 11 }, 2: { id: 2, name: 'Station 2', factoryId: 11 } },
        stations: [{ id: 1, name: 'Station 1', factoryId: 11 }, { id: 2, name: 'Station 2', factoryId: 11 }],
        factoriesMap: {
          11: { id: 11, name: 'Factory 1', stations: [{ id: 1, name: 'Station 1', factoryId: 11 }, { id: 2, name: 'Station 2', factoryId: 11 }] },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        showFullscreenDialogs: true,
        isMobileView: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('groupedStations', () => {
    it('returns grouped stations', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.groupedStations).toEqual([
        {
          id: 11,
          groupLabel: 'Factory 1',
          isOpen: false,
          groupItems: {
            21: {
              id: 21,
              groupLabel: 'Station group1',
              isOpen: false,
              subGroupItems: [
                {
                  id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
                },
                {
                  id: 2, name: 'Station 2', factoryId: 11, groupId: 21,
                },
              ],
            },
          },
        },
        {
          id: 12,
          groupLabel: 'Factory 2',
          isOpen: false,
          groupItems: {
            22: {
              id: 22,
              groupLabel: 'Station group2',
              isOpen: false,
              subGroupItems: [
                {
                  id: 3, name: 'Station 3', factoryId: 12, groupId: 22,
                },
              ],
            },
          },
        },
      ]);
    });

    it('returns grouped stations with opened group and subgroup, when there is only one item', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          stationsMap: {
            1: {
              id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
            },
          },
          stations: [{
            id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
          }],
          stationGroupsMap: { 21: { id: 21, name: 'Station group1', factoryId: 11 } },
          factoriesMap: { 11: { id: 11, name: 'Factory 1', stations: [{ id: 1, name: 'Station 1', factoryId: 11 }] } },
        },
      });

      expect(wrapper.vm.groupedStations).toEqual([
        {
          id: 11,
          groupLabel: 'Factory 1',
          isOpen: true,
          groupItems: {
            21: {
              id: 21,
              groupLabel: 'Station group1',
              isOpen: true,
              subGroupItems: [
                {
                  id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
                },
              ],
            },
          },
        },
      ]);
    });
  });

  describe('onSelectStation', () => {
    it('calls router push and close dialog', () => {
      const pinia = createTestingPinia({ createSpy: vi.fn });

      const profileStore = useProfileStore(pinia);
      profileStore.currentUser = { defaultStationId: 1 };

      const stationStore = useStationStore(pinia);
      stationStore.lineviewStation = { id: 1 };
      stationStore.stationsMap = defaultStationsMap;
      stationStore.stations = defaultStations;
      stationStore.stationGroups = defaultStationGroups;
      stationStore.stationGroupsMap = defaultStationGroupsMap;

      const factoryStore = useFactoryStore(pinia);
      factoryStore.factoriesMap = defaultFactoriesMap;

      const deviceStore = useDeviceStore(pinia);
      deviceStore.showFullscreenDialogs = false;
      deviceStore.isMobileView = false;

      const wrapper = shallowMount(StationSelectDialog, {
        global: { plugins: [pinia], mocks: { $router: { push: vi.fn().mockResolvedValue({}) } } },
      });

      const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');
      wrapper.vm.onSelectStation(2);

      expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'shiftview', params: { stationId: 2 } });
      expect(closeDialogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
