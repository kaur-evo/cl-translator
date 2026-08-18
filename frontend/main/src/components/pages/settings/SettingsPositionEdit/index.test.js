import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsPositionEdit from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import usePositionStore from '@/stores/position';
import useDeviceStore from '@/stores/device';
import translationApi from '@/api/translationApi';

vi.mock('@/api/translationApi');

translationApi.getTranslations.mockResolvedValue([]);

const router = {
  $router: {
    push: vi.fn(),
  },
};
const route = {
  $route: {
    params: { id: 1 },
  },
};

const defaultPiniaState = {
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, highestUserRole: 'COMPANY_ADMIN' },
  position: {
    positions: [
      {
        id: 1, primaryName: 'test position', name: 'test position', stationIds: [],
      },
    ],
  },
  station: {
    stations: [
      { id: 1, name: 'station 1', groupId: 1 },
      { id: 2, name: 'station 2', groupId: 1 },
      { id: 3, name: 'station 3', groupId: 2 },
    ],
    stationGroups: [{ id: 1 }, { id: 2 }],
  },
  comment: {
    commentsList: [
      {
        id: 1, name: 'comment 1', stationIds: [1, 2], groupId: 1,
      },
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
      {
        id: 3, name: 'comment 3', stationIds: [2, 3], groupId: 2,
      },
    ],
    commentGroupsList: [{ id: 1 }, { id: 2 }],
  },
  perfComment: {
    perfCommentsList: [
      {
        id: 1, name: 'comment 1', stationIds: [1, 2], groupId: 1,
      },
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
      {
        id: 3, name: 'comment 3', stationIds: [2, 3], groupId: 2,
      },
    ],
    perfCommentGroupsList: [{ id: 1 }, { id: 2 }],
  },
};

const createPiniaWithNullLoading = (stateOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...stateOverrides },
  });
  const positionStore = usePositionStore(pinia);
  positionStore.isLoading = null;
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

const createGlobalWithFormPage = (piniaOverrides) => createGlobal({
  pinia: createPiniaWithNullLoading(piniaOverrides),
  router: { ...router, ...route },
});

const global = createGlobal({
  pinia: createPiniaWithNullLoading(),
  router: { ...router, ...route },
});

const createWrapper = (options) => shallowMount(SettingsPositionEdit, {
  global: {
    ...createGlobalWithFormPage(),
    stubs: { 'form-page-template': false },
  },
  ...options,
});

const propsDefault = {};

describe('SettingsPositionEdit', () => {
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

  it('renders correctly if selected position is not in positionsMap', () => {
    const wrapper = shallowMount(SettingsPositionEdit, {
      global: createGlobal({
        piniaOptions: {
          initialState: {
            ...defaultPiniaState,
            position: {
              positions: [
                {
                  id: 1, primaryName: 'test position', name: 'test position', stationIds: [],
                },
              ],
            },
          },
        },
        router: { ...router, $route: { params: { id: 2 } } },
      }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that comments and perfComments are filtered by selected stations', async () => {
    const wrapper = shallowMount(SettingsPositionEdit, {
      global: { ...global },
    });

    expect(wrapper.vm.filteredComments).toEqual(defaultPiniaState.comment.commentsList);
    expect(wrapper.vm.filteredPerformanceLossReasons).toEqual(defaultPiniaState.perfComment.perfCommentsList);

    await (wrapper.setData({ formData: { stationIds: [1] } }));
    expect(wrapper.vm.filteredComments).toEqual([
      {
        id: 1, name: 'comment 1', stationIds: [1, 2], groupId: 1,
      },
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
    ]);
    expect(wrapper.vm.filteredPerformanceLossReasons).toEqual([
      {
        id: 1, name: 'comment 1', stationIds: [1, 2], groupId: 1,
      },
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
    ]);

    await (wrapper.setData({ formData: { stationIds: [3] } }));
    expect(wrapper.vm.filteredComments).toEqual([
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
      {
        id: 3, name: 'comment 3', stationIds: [2, 3], groupId: 2,
      },
    ]);
    expect(wrapper.vm.filteredPerformanceLossReasons).toEqual([
      {
        id: 2, name: 'comment 2', stationIds: [1, 3], groupId: 1,
      },
      {
        id: 3, name: 'comment 3', stationIds: [2, 3], groupId: 2,
      },
    ]);
  });

  describe('hiddenStationsCount', () => {
    it('returns 0 if all current position stations are in stationsWithAdminPermissions array', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              station: {
                stations: [
                  { id: 1, name: 'station 1', groupId: 1 },
                  { id: 2, name: 'station 2', groupId: 1 },
                  { id: 3, name: 'station 3', groupId: 2 },
                ],
                stationGroups: [{ id: 1 }, { id: 2 }],
              },
              position: {
                positions: [
                  {
                    id: 1, primaryName: 'test position', name: 'test position', stationIds: [1, 2, 3],
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: { id: 1 } } },
        }),
      });

      expect(wrapper.vm.hiddenStationsCount).toBe(0);
    });

    it('returns correct count if some current position stations are not in stationsWithAdminPermissions array', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              station: {
                stations: [
                  { id: 1, name: 'station 1', groupId: 1 },
                  { id: 2, name: 'station 2', groupId: 1 },
                  { id: 3, name: 'station 3', groupId: 2 },
                ],
                stationGroups: [{ id: 1 }, { id: 2 }],
              },
              position: {
                positions: [
                  {
                    id: 1, primaryName: 'test position', name: 'test position', stationIds: [1, 5, 6],
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: { id: 1 } } },
        }),
      });

      expect(wrapper.vm.hiddenStationsCount).toBe(2);
    });
  });

  test('that positionsMap watcher calls setFormData', async () => {
    const wrapper = shallowMount(SettingsPositionEdit, {
      global: { ...global },
    });

    const setFormDataSpy = vi.spyOn(wrapper.vm, 'setFormData');
    await wrapper.vm.$options.watch.positionsMap.call(wrapper.vm);
    expect(setFormDataSpy).toHaveBeenCalled();
  });

  test('that mounted calls setFormData', () => {
    const wrapper = shallowMount(SettingsPositionEdit, {
      global: { ...global },
    });

    const setFormDataSpy = vi.spyOn(wrapper.vm, 'setFormData');
    wrapper.vm.$options.mounted.call(wrapper.vm);
    expect(setFormDataSpy).toHaveBeenCalled();
  });

  describe('setFormData', () => {
    it('sets formData correctly when position exists', () => {
      const positionData = {
        id: 11, primaryName: 'test position', name: 'test position', stationIds: [1, 2], commentIds: [1, 2], performanceCommentIds: [1],
      };
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: { positions: [positionData] },
            },
          },
          router: { ...router, $route: { params: { id: 11 } } },
        }),
      });

      wrapper.vm.setFormData();
      expect(wrapper.vm.formData).toEqual(positionData);
    });

    it('does not set formData when route id does not exist', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: {
                positions: [
                  {
                    id: 11, primaryName: 'test position', name: 'test position', stationIds: [1, 2], commentIds: [1, 2], performanceCommentIds: [1],
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: {} } },
        }),
      });

      wrapper.vm.setFormData();
      expect(wrapper.vm.formData).toEqual({
        primaryName: '',
        id: undefined,
        stationIds: [],
        commentIds: [],
        commentsEnabled: false,
        performanceCommentIds: [],
        performanceCommentsEnabled: false,
      });
    });
  });

  describe('isRemovedPosition', () => {
    it('returns false if isLoading is true', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: { positions: [], loading: ['loading'] },
            },
          },
          router: { ...router, $route: { params: { id: 1 } } },
        }),
      });

      expect(wrapper.vm.isRemovedPosition).toBe(false);
    });

    it('returns false if positionId does not exist', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: { ...global, mocks: { ...global.mocks, $route: { params: {} } } },
      });

      expect(wrapper.vm.isRemovedPosition).toBe(false);
    });

    it('returns false if positionId exists, position is in positionsMap and not marked as deleted', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: {
                positions: [
                  {
                    id: 1, primaryName: 'test position', name: 'test position', stationIds: [], deleted: false,
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: { id: 1 } } },
        }),
      });

      expect(wrapper.vm.isRemovedPosition).toBe(false);
    });

    it('returns true if positionId exists, position is in positionsMap and marked as deleted', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: {
                positions: [
                  {
                    id: 1, primaryName: 'test position', name: 'test position', stationIds: [], deleted: true,
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: { id: 1 } } },
        }),
      });

      expect(wrapper.vm.isRemovedPosition).toBe(true);
    });

    it('returns true if positionId exists but position is not in positionsMap', () => {
      const wrapper = shallowMount(SettingsPositionEdit, {
        global: createGlobal({
          piniaOptions: {
            initialState: {
              ...defaultPiniaState,
              position: {
                positions: [
                  {
                    id: 1, primaryName: 'test position', name: 'test position', stationIds: [],
                  },
                ],
              },
            },
          },
          router: { ...router, $route: { params: { id: 2 } } },
        }),
      });

      expect(wrapper.vm.isRemovedPosition).toBe(true);
    });
  });
});
