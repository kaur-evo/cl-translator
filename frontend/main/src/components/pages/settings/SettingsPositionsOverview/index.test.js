import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsPositionsOverview from './index.vue';

import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import useDeviceStore from '@/stores/device';

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
  position: {
    positions: [
      {
        name: 'position 1', stationIds: [1], commentIds: [1, 2], performanceCommentIds: [1], commentsEnabled: true, performanceCommentsEnabled: true,
      },
      {
        name: 'position 2', stationIds: [1], commentIds: [1], performanceCommentIds: [], commentsEnabled: true, performanceCommentsEnabled: true,
      },
      {
        name: 'position 3', stationIds: [2], commentIds: [], performanceCommentIds: [1, 2], commentsEnabled: true, performanceCommentsEnabled: true,
      },
    ],
  },
  station: {
    stations: [
      { id: 1, name: 'station 1', factoryId: 1 },
      { id: 2, name: 'station 2', factoryId: 2 },
    ],
    stationGroups: [],
  },
  factory: {
    factories: [{ id: 1, name: 'factory 1' }, { id: 2, name: 'factory 2' }],
  },
  comment: {
    commentsList: [
      { id: 1, name: 'comment 1' },
      { id: 2, name: 'comment 2' },
    ],
    commentGroupsList: [],
  },
  perfComment: {
    perfCommentsList: [
      { id: 1, name: 'perf comment 1' },
      { id: 2, name: 'perf comment 2' },
    ],
    perfCommentGroupsList: [],
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

describe('SettingsPositionsOverview', () => {
  test('it mounts correctly', async () => {
    const wrapper = shallowMount(SettingsPositionsOverview, {
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('tablePositionData', async () => {
    const wrapper = shallowMount(SettingsPositionsOverview, {
      global: { plugins: [createPinia()] },
    });

    await flushPromises();

    expect(wrapper.vm.tablePositions).toEqual([
      {
        name: 'position 1',
        stationIds: [1],
        stationNamesArray: ['station 1'],
        commentIds: [1, 2],
        performanceCommentIds: [1],
        factoryIds: [1],
        factoryNamesArray: ['factory 1'],
        stopReasonNames: 'comment 1, comment 2',
        performanceReasonNames: 'perf comment 1',
        commentsEnabled: true,
        performanceCommentsEnabled: true,
      },
      {
        name: 'position 2',
        stationIds: [1],
        stationNamesArray: ['station 1'],
        commentIds: [1],
        performanceCommentIds: [],
        factoryIds: [1],
        factoryNamesArray: ['factory 1'],
        stopReasonNames: 'comment 1',
        performanceReasonNames: 'All',
        commentsEnabled: true,
        performanceCommentsEnabled: true,
      },
      {
        name: 'position 3',
        stationIds: [2],
        stationNamesArray: ['station 2'],
        commentIds: [],
        performanceCommentIds: [1, 2],
        factoryIds: [2],
        factoryNamesArray: ['factory 2'],
        stopReasonNames: 'All',
        performanceReasonNames: 'perf comment 1, perf comment 2',
        commentsEnabled: true,
        performanceCommentsEnabled: true,
      },
    ]);
  });

  describe('isListView', () => {
    it('returns true if toggleBtnValue is LIST', () => {
      const wrapper = shallowMount(SettingsPositionsOverview, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.toggleBtnValue = builtInViewTypes.LIST;
      expect(wrapper.vm.isListView).toBe(true);
    });

    it('returns false if toggleBtnValue is GROUPS', () => {
      const wrapper = shallowMount(SettingsPositionsOverview, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.toggleBtnValue = builtInViewTypes.GROUPS;
      expect(wrapper.vm.isListView).toBe(false);
    });
  });
});
