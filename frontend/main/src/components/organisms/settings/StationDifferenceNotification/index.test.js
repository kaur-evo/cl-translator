import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsScrapReasonEdit from './index.vue';

import useStationStore from '@/stores/station';

const stationsMapData = {
  1: {
    id: 1, groupId: 1, factoryId: 1, name: 'station 1',
  },
  2: {
    id: 2, groupId: 1, factoryId: 1, name: 'station 2',
  },
  3: {
    id: 3, groupId: 1, factoryId: 1, name: 'station 3',
  },
  4: {
    id: 4, groupId: 2, factoryId: 2, name: 'station 4',
  },
};

const $route = { params: {} };
const mocks = { $route };

const createWrapper = (props) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const stationStore = useStationStore(pinia);
  stationStore.stationsMap = stationsMapData;

  return shallowMount(SettingsScrapReasonEdit, {
    global: { plugins: [pinia], mocks },
    props,
  });
};

describe('StationDifferenceNotification', () => {
  it('renders correctly when stationsToBeRemoved prop is empty', async () => {
    const wrapper = createWrapper({ stationsToBeRemoved: [] });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when stationsToBeRemoved prop is not empty', async () => {
    const wrapper = createWrapper({ stationsToBeRemoved: [1, 2, 3] });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
});
