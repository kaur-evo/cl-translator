import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsStationsOverview from './index.vue';

import useDeviceStore from '@/stores/device';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
  factory: {
    factories: [{ id: 21, name: 'Factory1' }],
  },
  station: {
    stations: [
      {
        id: 11, name: 'station 1', groupId: 1, factoryId: 21, emptyShiftCommentId: 0,
      },
      {
        id: 12, name: 'station 2', groupId: 2, factoryId: 21, emptyShiftCommentId: 1,
      },
    ],
    stationGroups: [
      { id: 1, name: 'testGroup1' },
      { id: 2, name: 'testGroup2' },
    ],
  },
  comment: {
    commentsList: [{ name: 'test comment', id: 1 }],
    commentGroupsList: [],
  },
};

const createPiniaInstance = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: { ...defaultPiniaState, ...overrides },
});

const createWrapper = (options) => {
  const pinia = createPiniaInstance();
  useDeviceStore(pinia).isMobileView = false;
  return shallowMount(SettingsStationsOverview, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {};

describe('SettingsStationsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('tableStations', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const { stations } = defaultPiniaState.station;
    expect(wrapper.vm.tableStations.length).toBe(2);
    expect(wrapper.vm.tableStations[0]).toEqual({
      ...stations[0],
      groupName: 'testGroup1',
      factoryNamesArray: ['Factory1'],
      emptyShiftReason: '-',
    });
    expect(wrapper.vm.tableStations[1]).toEqual({
      ...stations[1],
      groupName: 'testGroup2',
      factoryNamesArray: ['Factory1'],
      emptyShiftReason: 'test comment',
    });
  });

  describe('isListViewVisible', () => {
    it('returns true if toggleBtnValue is LIST', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      wrapper.vm.toggleBtnValue = builtInViewTypes.LIST;
      expect(wrapper.vm.isListViewVisible).toBe(true);
    });

    it('returns false if toggleBtnValue is GROUPS', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      wrapper.vm.toggleBtnValue = builtInViewTypes.GROUPS;
      expect(wrapper.vm.isListViewVisible).toBe(false);
    });
  });
});
