import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsSpeedLossOverview from './index.vue';

import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import useDeviceStore from '@/stores/device';

const route = {
  $route: {
    name: 'perfCommentOverview',
    params: {
      isGroupEdit: false,
    },
    query: {},
  },
};

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
  factory: { factories: [{ id: 21, name: 'Factory1' }, { id: 22, name: 'Factory2' }] },
  perfComment: {
    perfCommentsList: [
      {
        id: 11, name: 'speed loss 1', groupId: 1, factoryIds: [21], stationIds: [31],
      },
      {
        id: 12, name: 'speed loss 2', groupId: 2, factoryIds: [21], stationIds: [31],
      },
      {
        id: 13, name: 'speed loss 3', groupId: 1, factoryIds: [21], stationIds: [],
      },
      {
        id: 14, name: 'speed loss 4', groupId: 2, factoryIds: [21], stationIds: [],
      },
      {
        id: 15, name: 'speed loss 5', groupId: 1, factoryIds: [], stationIds: [],
      },
      {
        id: 16, name: 'speed loss 6', groupId: 2, factoryIds: [], stationIds: [],
      },
      {
        id: 17, name: 'speed loss 7', groupId: 3, factoryIds: [22], stationIds: [],
      },
      {
        id: 18, name: 'speed loss 8', groupId: 3, factoryIds: [], stationIds: [],
      },
    ],
    perfCommentGroupsList: [
      {
        id: 1, name: 'testGroup1', local: false, factoryIds: [],
      },
      {
        id: 2, name: 'testGroup2', local: true, factoryIds: [21],
      },
    ],
  },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...overrides },
  });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

const createWrapper = (options = {}) => shallowMount(SettingsSpeedLossOverview, {
  global: {
    plugins: [createPinia(options.piniaOverrides)],
    mocks: { ...route },
  },
  ...options,
});

const propsDefault = {};

describe('SettingsSpeedLossOverview', () => {
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

  it('renders correctly if userHasGlobalGroupsIcon is false', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      piniaOverrides: {
        factory: { factories: [{ id: 21, name: 'Factory1' }] },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
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
