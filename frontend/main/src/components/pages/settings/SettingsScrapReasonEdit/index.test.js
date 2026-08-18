import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { createTestingPinia } from '@pinia/testing';

import SettingsScrapReasonEdit from './index.vue';

import { useTagStore } from '@/stores';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import useDeviceStore from '@/stores/device';

const createPiniaWithDevice = (options) => {
  const pinia = createTestingPinia(options);
  useDeviceStore(pinia).isMobileView = false;
  useDeviceStore(pinia).screenWidth = 1920;
  return pinia;
};

const scrapReasonGroupsList = [
  { id: 1, local: false, factoryIds: [] },
  { id: 2, local: true, factoryIds: [1] },
  { id: 3, local: true, factoryIds: [2] },
  { id: 4, local: true, factoryIds: [2, 1] },
  { id: 5, local: false, factoryIds: [] },
];

const defaultPiniaInitialState = {
  station: {
    stations: [
      { id: 1, groupId: 1, factoryId: 1 },
      { id: 2, groupId: 1, factoryId: 1 },
      { id: 3, groupId: 1, factoryId: 1 },
      { id: 4, groupId: 2, factoryId: 2 },
    ],
    stationGroups: [{ id: 1, name: 'testGroup1' }, { id: 2, name: 'testGroup2' }],
  },
  scrapReason: {
    scrapReasonsList: [
      { id: 1, groupId: 2, primaryName: 'scrap reason 1' },
      { id: 2, groupId: 1, primaryName: 'scrap reason 2' },
    ],
    scrapReasonGroupsList,
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
    highestUserRole: 'COMPANY_ADMIN',
  },
  feature: {
    tags: true,
    enableIncreaseQtyWithScrap: true,
  },
};


const $route = { params: {} };

let pinia;

describe('SettingsScrapReasonEdit', () => {
  beforeEach(() => {
    pinia = createPiniaWithDevice({
      createSpy: vi.fn,
      stubActions: false,
      initialState: cloneDeep(defaultPiniaInitialState),
    });
  });

  it('renders correctly if selected scrap reason is not in scrapReasonsMap', async () => {
    const localPinia = createPiniaWithDevice({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...cloneDeep(defaultPiniaInitialState),
        scrapReason: {
          scrapReasonsList: [
            {
              id: 2, groupId: 1, primaryName: 'scrap reason 2', deleted: true,
            },
          ],
          scrapReasonGroupsList,
        },
      },
    });
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $route: { params: { id: 2 } } },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new', async () => {
    const wrapper = mount(SettingsScrapReasonEdit, {
      shallow: true,
      global: {
        stubs: { 'form-page-template': false },
        plugins: [pinia],
        mocks: { $route },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing', async () => {
    const wrapper = mount(SettingsScrapReasonEdit, {
      shallow: true,
      global: {
        stubs: { 'form-page-template': false },
        plugins: [pinia],
        mocks: { $route: { params: { id: 1 } } },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing and stationsToBeRemoved is not empty', async () => {
    const wrapper = mount(SettingsScrapReasonEdit, {
      shallow: true,
      global: {
        stubs: { 'form-page-template': false },
        plugins: [pinia],
        mocks: { $route: { params: { id: 1 } } },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        stationsToBeRemoved() {
          return [1];
        },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when edit is forbidden', async () => {
    const wrapper = mount(SettingsScrapReasonEdit, {
      shallow: true,
      global: {
        stubs: { 'form-page-template': false },
        plugins: [pinia],
        mocks: { $route: { params: { id: 1 } } },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        editForbidden: () => true,
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('has haveTranslationsChanged false by default', () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
    });

    expect(wrapper.vm.haveTranslationsChanged).toBe(false);
  });

  test('that beforeRouteEnter sets itemGroupId from params if it exists', async () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { params: {} } },
      },
    });
    expect(wrapper.vm.groupId).toBeUndefined();
    await wrapper.vm.$options.beforeRouteEnter.call(wrapper.vm, { query: { itemGroupId: 2 }, params: {} }, null, (cb) => cb(wrapper.vm));
    expect(wrapper.vm.formData.groupId).toBe(2);
  });

  test('that beforeRouteLeave calls promptSavingTranslationsChanges when haveTranslationsChanged is true', () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
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
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const nextFun = vi.fn();

    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', nextFun);

    expect(nextFun).toBeCalledTimes(1);
  });

  test('that promptSavingTranslationsChanges calls openConfirmDialog', () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
    });

    const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.promptSavingTranslationsChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('filteredStations', async () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
    });

    const allStations = defaultPiniaInitialState.station.stations;

    await wrapper.setData({ formData: { groupId: 1 } }); // global group selected, all stations visible
    expect(wrapper.vm.filteredStations).toEqual(allStations);
    await wrapper.setData({ formData: { groupId: 2 } }); // only factory 1 stations visible
    expect(wrapper.vm.filteredStations).toEqual([{ id: 1, groupId: 1, factoryId: 1 }, { id: 2, groupId: 1, factoryId: 1 }, { id: 3, groupId: 1, factoryId: 1 }]);
    await wrapper.setData({ formData: { groupId: 3 } }); // only factory 2 stations visible
    expect(wrapper.vm.filteredStations).toEqual([{ id: 4, groupId: 2, factoryId: 2 }]);
    await wrapper.setData({ formData: { groupId: 4 } }); // both factory 1 and factory 2 stations visible
    expect(wrapper.vm.filteredStations).toEqual(allStations);
  });

  test('filteredGroups if user can edit global groups', async () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        isEdit() {
          return false;
        },
      },
    });

    expect(wrapper.vm.filteredGroups).toEqual(scrapReasonGroupsList);
  });

  test('filteredGroups if user cannot edit global groups and it is reason adding', async () => {
    const localPinia = createPiniaWithDevice({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...cloneDeep(defaultPiniaInitialState),
        profile: {
          currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
          highestUserRole: 'FACTORY_ADMIN',
        },
      },
    });
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $route },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        isEdit() {
          return false;
        },
      },
    });

    expect(wrapper.vm.filteredGroups).toEqual(scrapReasonGroupsList.filter((g) => g.local));
  });

  test('filteredGroups for local group reason edit if user cannot edit global groups', async () => {
    const localPinia = createPiniaWithDevice({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...cloneDeep(defaultPiniaInitialState),
        profile: {
          currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
          highestUserRole: 'FACTORY_ADMIN',
        },
      },
    });
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $route: { params: { id: 1 } } },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        isEdit() {
          return true;
        },
      },
    });

    expect(wrapper.vm.filteredGroups).toEqual(scrapReasonGroupsList.filter((g) => g.local));
  });

  test('filteredGroups for global group reason edit if user cannot edit global groups', async () => {
    const localPinia = createPiniaWithDevice({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...cloneDeep(defaultPiniaInitialState),
        profile: {
          currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
          highestUserRole: 'FACTORY_ADMIN',
        },
      },
    });
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $route: { params: { id: 2 } } },
      },
      computed: {
        ...SettingsScrapReasonEdit.computed,
        isEdit() {
          return true;
        },
      },
    });

    expect(wrapper.vm.filteredGroups).toEqual(scrapReasonGroupsList.filter((g) => g.local || g.id === 1));
  });

  test('that groupId is set if it is given in route query', async () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { query: { groupId: 1 }, params: {} } },
      },
    });

    expect(wrapper.vm.formData.groupId).toBe(1);
  });

  test('that routeToOverview calls router.push with scrapReasonOverview', () => {
    const push = vi.fn();
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { ...$route, query: {} }, $router: { push } },
      },
    });

    wrapper.vm.routeToOverview();

    expect(push).toBeCalledWith({ name: 'scrapReasonOverview', query: {} });
  });

  test('that onDelete calls openConfirmDialog with correct config', () => {
    const wrapper = shallowMount(SettingsScrapReasonEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { params: { id: 2 } } },
      },
    });

    const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.onDelete();

    expect(spy).toBeCalledWith({
      action: expect.any(Function),
      cancelText: 'Cancel',
      confirmText: 'Delete',
      text: 'Are you sure you want to delete {value}?',
      title: 'Confirmation',
    });
  });

  describe('isRemovedScrapReason', () => {
    it('returns false if isLoading is true', () => {
      const localPinia = createPiniaWithDevice({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...cloneDeep(defaultPiniaInitialState),
          scrapReason: {
            scrapReasonsList: defaultPiniaInitialState.scrapReason.scrapReasonsList,
            scrapReasonGroupsList,
            loading: ['loading'],
          },
        },
      });
      const wrapper = shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedScrapReason).toBe(false);
    });

    it('returns false if scrap reason id is not in route params', () => {
      const wrapper = shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [pinia],
          mocks: { $route: { params: {} } },
        },
      });

      expect(wrapper.vm.isRemovedScrapReason).toBe(false);
    });

    it('returns true if scrap reason does not exist in scrapReasonsMap', () => {
      const localPinia = createPiniaWithDevice({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...cloneDeep(defaultPiniaInitialState),
          scrapReason: {
            scrapReasonsList: [
              {
                id: 1, groupId: 2, primaryName: 'scrap reason 1', deleted: false,
              },
            ],
            scrapReasonGroupsList,
          },
        },
      });
      const wrapper = shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedScrapReason).toBe(true);
    });

    it('returns false if scrap reason exists in scrapReasonsMap but is not deleted', () => {
      const localPinia = createPiniaWithDevice({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...cloneDeep(defaultPiniaInitialState),
          scrapReason: {
            scrapReasonsList: [
              {
                id: 2, groupId: 1, primaryName: 'scrap reason 2', deleted: false,
              },
            ],
            scrapReasonGroupsList,
          },
        },
      });
      const wrapper = shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedScrapReason).toBe(false);
    });

    it('returns true if scrap reason exists in scrapReasonsMap and is deleted', () => {
      const localPinia = createPiniaWithDevice({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...cloneDeep(defaultPiniaInitialState),
          scrapReason: {
            scrapReasonsList: [
              {
                id: 2, groupId: 1, primaryName: 'scrap reason 2', deleted: true,
              },
            ],
            scrapReasonGroupsList,
          },
        },
      });
      const wrapper = shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: { id: 2 } } },
        },
      });

      expect(wrapper.vm.isRemovedScrapReason).toBe(true);
    });
  });

  describe('fetchTags', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls fetchTags on mount if tags are enabled', () => {
      shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });
      const tagStoreInstance = useTagStore(pinia);
      expect(tagStoreInstance.fetchTags).toHaveBeenCalledWith({ entity: [enabledTagEntities.SCRAP_REASON] });
    });

    it('does not call fetchTags on mount if tags are disabled', () => {
      const localPinia = createPiniaWithDevice({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...cloneDeep(defaultPiniaInitialState),
          feature: {
            tags: false,
            enableIncreaseQtyWithScrap: true,
          },
        },
      });

      shallowMount(SettingsScrapReasonEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route },
        },
      });
      const tagStoreInstance = useTagStore(localPinia);
      expect(tagStoreInstance.fetchTags).not.toHaveBeenCalled();
    });
  });
});
