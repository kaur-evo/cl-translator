import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsStopReasonEdit from './index.vue';

import { useTagStore } from '@/stores';
import useDeviceStore from '@/stores/device';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';

const defaultStations = [{ id: 1, groupId: 1, factoryId: 1 }, { id: 2, groupId: 2, factoryId: 2 }];
const defaultStationGroups = [{ id: 1, name: 'testGroup1' }, { id: 2, name: 'testGroup2' }];

const defaultCommentsList = [
  {
    id: 1,
    primaryName: 'comment 1',
    stationIds: [1],
    groupId: 1,
    maxDuration: null,
    negative: true,
    noteRequired: false,
    requirePosition: false,
    technical: true,
    tagIds: [],
    noteRequiredDuration: null,
    includeInOee: true,
    joiningAllowed: false,
  },
  {
    id: 2,
    primaryName: 'comment 2',
    stationIds: [2],
    groupId: 2,
    maxDuration: 180,
    negative: false,
    noteRequired: true,
    requirePosition: true,
    technical: false,
    tagIds: [1, 2],
    noteRequiredDuration: 180,
    includeInOee: false,
    joiningAllowed: true,
  },
];

const defaultCommentGroupsList = [
  { id: 1, name: 'comment group 1' },
  { id: 2, name: 'comment group 2' },
];

const defaultPiniaInitialState = {
  station: {
    stations: defaultStations,
    stationGroups: defaultStationGroups,
  },
  comment: {
    commentsList: defaultCommentsList,
    commentGroupsList: defaultCommentGroupsList,
    loading: [],
  },
  feature: {
    tags: true,
  },
  position: {
    positions: [
      { name: 'position 1', stationIds: [1], commentIds: [1, 2], stationOrder: [] },
      { name: 'position 2', stationIds: [1], commentIds: [1], stationOrder: [] },
      { name: 'position 3', stationIds: [2], commentIds: [], stationOrder: [] },
    ],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
    highestUserRole: 'COMPANY_ADMIN',
  },
};


const $route = { params: {} };

let pinia;

describe('SettingsStopReasonEdit', () => {
  beforeEach(() => {
    pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState });
    useDeviceStore(pinia).isMobileView = false;
  });

  it('renders correctly when selected stop reason is not in commentsMap', async () => {
    const localPinia = createTestingPinia({
      initialState: {
        ...defaultPiniaInitialState,
        comment: {
          ...defaultPiniaInitialState.comment,
          commentsList: [
            {
              id: 11,
              primaryName: 'Deleted Stop Reason',
              stationIds: [1],
              groupId: 1,
              maxDuration: null,
              negative: true,
              noteRequired: false,
              requirePosition: false,
              technical: true,
              tagIds: [],
              noteRequiredDuration: null,
              includeInOee: true,
              joiningAllowed: false,
              deleted: true,
            },
          ],
        },
      },
    });
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 11 } } },
        plugins: [localPinia],
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 1 } } },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when edit is forbidden', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 1 } } },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
      computed: {
        ...SettingsStopReasonEdit.computed,
        editForbidden: () => true,
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('has haveTranslationsChanged false by default', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.haveTranslationsChanged).toBe(false);
  });

  test('that beforeRouteEnter sets itemGroupId from params if it exists', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        plugins: [createTestingPinia({ stubActions: false, initialState: defaultPiniaInitialState })],
        mocks: { $route: { params: {} } },
      },
    });
    expect(wrapper.vm.groupId).toBeUndefined();
    await wrapper.vm.$options.beforeRouteEnter.call(wrapper.vm, { query: { itemGroupId: 2 }, params: {} }, null, (cb) => cb(wrapper.vm));
    expect(wrapper.vm.formData.groupId).toBe(2);
  });

  test('that beforeRouteLeave calls promptSavingTranslationsChanges when haveTranslationsChanged is true', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
      data: () => ({
        haveTranslationsChanged: true,
      }),
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const spy = vi.spyOn(wrapper.vm, 'promptSavingTranslationsChanges');
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());

    expect(spy).toBeCalledTimes(1);
  });

  test('that beforeRouteLeave calls next if haveTranslationsChanged is false', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const nextFun = vi.fn();

    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', nextFun);

    expect(nextFun).toBeCalledTimes(1);
  });

  test('that promptSavingTranslationsChanges calls openConfirmDialog', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.promptSavingTranslationsChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('that duration is valid if value is null', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.isDurationValid(null)).toBe(true);
  });

  test('that duration is valid if value exists and it is between 60s and 86400s', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.isDurationValid(100)).toBe(true);
  });

  test('that duration is invalid if value exists and it is not between 60s and 86400s', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.isDurationValid(86401)).toBe(false);
  });

  test('that isMaxDurationSelected is set to true, if maxDuration setting is checked', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.isMaxDurationSelected).toBe(false);
    wrapper.vm.onSettingToggled('maxDuration', true);
    expect(wrapper.vm.isMaxDurationSelected).toBe(true);
  });

  test('that maxDuration is set to null, if maxDuration setting is unchecked', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 2 } } },
        plugins: [pinia],
      },
    });

    await flushPromises();
    expect(wrapper.vm.formData.maxDuration).toBe(180);
    wrapper.vm.onSettingToggled('maxDuration', false);
    expect(wrapper.vm.formData.maxDuration).toBe(null);
  });

  test('that noteRequiredDuration is set to null, if noteRequired setting is unchecked', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 2 } } },
        plugins: [pinia],
      },
    });

    await flushPromises();
    expect(wrapper.vm.formData.noteRequiredDuration).toBe(180);
    wrapper.vm.onSettingToggled('noteRequired', false);
    expect(wrapper.vm.formData.noteRequiredDuration).toBe(null);
  });

  test('that includeInOee is set to default value, if unplanned stop type is selected', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 2 } } },
        plugins: [pinia],
      },
    });

    await flushPromises();
    expect(wrapper.vm.formData.negative).toBe(false); // type is planned
    expect(wrapper.vm.formData.includeInOee).toBe(false);
    wrapper.vm.onStopTypeInput(true);
    expect(wrapper.vm.formData.negative).toBe(true); // type is unplanned
    expect(wrapper.vm.formData.includeInOee).toBe(true);
  });

  test('that technical is set to default value, if planned stop type is selected', async () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route: { params: { id: 1 } } },
        plugins: [pinia],
      },
    });

    await flushPromises();
    expect(wrapper.vm.formData.negative).toBe(true); // type is unplanned
    expect(wrapper.vm.formData.technical).toBe(true); // include in technical availability
    wrapper.vm.onStopTypeInput(false);
    expect(wrapper.vm.formData.negative).toBe(false); // type is planned
    expect(wrapper.vm.formData.technical).toBe(false);
  });

  describe('isRemovedStopReason', () => {
    it('returns false if isLoading is true', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          comment: {
            ...defaultPiniaInitialState.comment,
            loading: ['loading'],
          },
        },
      });
      const wrapper = shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route: { params: { id: 1 } } },
          plugins: [localPinia],
        },
      });

      expect(wrapper.vm.isRemovedStopReason).toBe(false);
    });

    it('returns false if comment id is not in route params', () => {
      const wrapper = shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route: { params: {} } },
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.isRemovedStopReason).toBe(false);
    });

    it('returns true if comment does not exist in commentsMap', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          comment: {
            ...defaultPiniaInitialState.comment,
            commentsList: [
              {
                id: 1,
                primaryName: 'Existing Stop Reason',
                stationIds: [1],
                groupId: 1,
                maxDuration: null,
                negative: true,
                noteRequired: false,
                requirePosition: false,
                technical: true,
                tagIds: [],
                noteRequiredDuration: null,
                includeInOee: true,
                joiningAllowed: false,
                deleted: false,
              },
            ],
          },
        },
      });
      const wrapper = shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route: { params: { id: 2 } } },
          plugins: [localPinia],
        },
      });

      expect(wrapper.vm.isRemovedStopReason).toBe(true);
    });

    it('returns false if comment exists in commentsMap but is not deleted', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          comment: {
            ...defaultPiniaInitialState.comment,
            commentsList: [
              {
                id: 1,
                primaryName: 'Existing Stop Reason',
                stationIds: [1],
                groupId: 1,
                maxDuration: null,
                negative: true,
                noteRequired: false,
                requirePosition: false,
                technical: true,
                tagIds: [],
                noteRequiredDuration: null,
                includeInOee: true,
                joiningAllowed: false,
                deleted: false,
              },
            ],
          },
        },
      });
      const wrapper = shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route: { params: { id: 1 } } },
          plugins: [localPinia],
        },
      });

      expect(wrapper.vm.isRemovedStopReason).toBe(false);
    });

    it('returns true if comment exists in commentsMap and is deleted', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          comment: {
            ...defaultPiniaInitialState.comment,
            commentsList: [
              {
                id: 11,
                primaryName: 'Deleted Stop Reason',
                stationIds: [1],
                groupId: 1,
                maxDuration: null,
                negative: true,
                noteRequired: false,
                requirePosition: false,
                technical: true,
                tagIds: [],
                noteRequiredDuration: null,
                includeInOee: true,
                joiningAllowed: false,
                deleted: true,
              },
            ],
          },
        },
      });
      const wrapper = shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route: { params: { id: 11 } } },
          plugins: [localPinia],
        },
      });

      expect(wrapper.vm.isRemovedStopReason).toBe(true);
    });
  });

  describe('fetchTags', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls fetchTags on mount if tags are enabled', () => {
      shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route },
          plugins: [pinia],
        },
      });
      const tagStoreInstance = useTagStore(pinia);
      expect(tagStoreInstance.fetchTags).toHaveBeenCalledWith({ entity: [enabledTagEntities.COMMENT] });
    });

    it('does not call fetchTags on mount if tags are disabled', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          feature: { tags: false },
        },
      });

      shallowMount(SettingsStopReasonEdit, {
        global: {
          mocks: { $route },
          plugins: [localPinia],
        },
      });
      const tagStoreInstance = useTagStore(localPinia);
      expect(tagStoreInstance.fetchTags).not.toHaveBeenCalled();
    });
  });

  test('that goToMachineLocationsSettings opens machine locations overview in a new tab', () => {
    const mockResolve = vi.fn().mockReturnValue({ href: '/settings/positions' });
    const mockRouter = { resolve: mockResolve };
    const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => {});

    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        plugins: [createTestingPinia({ stubActions: false, initialState: defaultPiniaInitialState })],
        mocks: { $route, $router: mockRouter },
      },
    });

    wrapper.vm.goToMachineLocationsSettings();

    expect(mockResolve).toHaveBeenCalledWith({ name: 'positionOverview' });
    expect(mockWindowOpen).toHaveBeenCalledWith('/settings/positions', '_blank');

    mockWindowOpen.mockRestore();
  });

  test('that onOpenLocationsHelp calls window.open with correct params', () => {
    const wrapper = shallowMount(SettingsStopReasonEdit, {
      global: {
        mocks: { $route },
        plugins: [pinia],
      },
    });

    window.open = vi.fn();

    wrapper.vm.onOpenLocationsHelp();
    expect(window.open).toHaveBeenCalledWith('https://support.evocon.com/Using-locations-for-production-stop-reasons-6cce1437ebed42c0b133c45e0a031005', '_blank');

    window.open.mockRestore();
  });
});
