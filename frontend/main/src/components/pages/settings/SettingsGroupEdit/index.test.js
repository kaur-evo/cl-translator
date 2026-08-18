import { shallowMount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { createTestingPinia } from '@pinia/testing';

import SettingsGroupEdit from './index.vue';

import {
  useTagStore,
  useProfileStore,
  useFactoryStore,
  useCommentStore,
  usePerfCommentStore,
  useScrapReasonStore,
  useChecklistTemplateStore,
  useDeviceStore,
  useFeatureStore,
} from '@/stores/index';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';

const router = {
  $router: {
    push: vi.fn(),
  },
};
const route = {
  $route: {
    query: {
      id: 1,
    },
  },
};
const mocks = {
  ...router,
  ...route,
};

const defaultGetterOverrides = {
  profile: {
    highestRoleAllows: () => false,
  },
  factory: {
    orderedWriteAccessFactories: [],
    hasMultipleFactories: false,
    factoriesMap: {},
  },
  comment: {
    commentGroupsWithAdminPermissionsMap: {
      1: {
        id: 1, primaryName: 'comment-group1', name: 'group 1', factoryIds: [], local: false,
      },
    },
  },
  perfComment: {
    perfCommentGroupsWithAdminPermissionsMap: {
      1: {
        id: 1, name: 'testGroup1', local: true, factoryIds: [21],
      },
    },
  },
  scrapReason: {
    scrapReasonGroupsWithAdminPermissionsMap: {
      1: {
        id: 1, name: 'testGroup1', local: true, factoryIds: [21],
      },
    },
  },
  checklistTemplate: {
    checklistGroupsMap: {},
  },
  device: {
    isMobileView: false,
    screenWidth: 1000,
  },
  feature: {
    tagsEnabled: true,
  },
};

const defaultInitialState = {
  tag: {
    tagsList: [{ id: 1 }, { id: 2 }, { id: 3 }],
  },
};

const createPinia = (stateOverrides = {}, getterOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      ...cloneDeep(defaultInitialState),
      ...stateOverrides,
    },
  });
  const merged = cloneDeep(defaultGetterOverrides);
  Object.entries(getterOverrides).forEach(([storeName, overrides]) => {
    merged[storeName] = { ...merged[storeName], ...overrides };
  });
  Object.assign(useProfileStore(pinia), merged.profile);
  Object.assign(useFactoryStore(pinia), merged.factory);
  Object.assign(useCommentStore(pinia), merged.comment);
  Object.assign(usePerfCommentStore(pinia), merged.perfComment);
  Object.assign(useScrapReasonStore(pinia), merged.scrapReason);
  Object.assign(useChecklistTemplateStore(pinia), merged.checklistTemplate);
  Object.assign(useDeviceStore(pinia), merged.device);
  Object.assign(useFeatureStore(pinia), merged.feature);
  useTagStore(pinia).fetchTags = vi.fn();
  return pinia;
};

const propsDefault = {
  namespace: 'comment',
  languageTextEntity: 'commentGroup',
  saveActionName: 'saveCommentGroup',
  fields: ['name', 'color', 'local', 'tags'],
  nameField: 'primaryName',
  deleteLoading: false,
};

describe('SettingsGroupEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
        stubs: { 'form-page-template': false },
        mocks,
      },
    });

    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });
  it('renders correctly - with one or less factory and no permission to edit global groups', async () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        stubs: { 'form-page-template': false },
        plugins: [createPinia()],
        mocks,
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - with one or less factory and permission to edit global groups', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia({}, { profile: { highestRoleAllows: () => true } })],
        stubs: { 'form-page-template': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - with multiple factories and no permission to edit global groups', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia({}, {
          factory: {
            hasMultipleFactories: true,
            orderedWriteAccessFactories: [{ id: 1 }, { id: 2 }],
          },
        })],
        stubs: { 'form-page-template': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly - with multiple factories and permission to edit global groups', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia({}, {
          profile: { highestRoleAllows: () => true },
          factory: {
            hasMultipleFactories: true,
            orderedWriteAccessFactories: [{ id: 1 }, { id: 2 }],
          },
        })],
        stubs: { 'form-page-template': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that group state is set correctly if selectedGroup is given', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
        mocks,
      },
    });

    expect(wrapper.vm.groupEntity).toEqual({
      factoryIds: [], id: 1, local: false, name: 'group 1', primaryName: 'comment-group1',
    });
  });

  test('that group state is set correctly if selectedGroup is not given and user has no permission to edit global groups', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, selectedGroup: null },
      global: {
        plugins: [createPinia({}, { factory: { orderedWriteAccessFactories: [{ id: 1 }] } })],
        mocks: { ...router, $route: { query: {} } },
      },
    });

    expect(wrapper.vm.groupEntity).toEqual({
      primaryName: '',
      color: '',
      local: true,
      factoryIds: [1],
    });
  });

  test('that group state is set correctly if selectedGroup is not given and user has permission to edit global groups', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, selectedGroup: null },
      global: {
        plugins: [createPinia({}, { profile: { highestRoleAllows: () => true } })],
        mocks: { ...router, $route: { query: {} } },
      },
    });

    expect(wrapper.vm.groupEntity).toEqual({
      primaryName: '',
      color: '',
      local: false,
      factoryIds: [],
    });
  });

  it('renders correctly with single factory selection if multiple factories available', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, fields: ['name', 'singleFactory'] },
      global: {
        plugins: [createPinia({}, {
          factory: {
            hasMultipleFactories: true,
            orderedWriteAccessFactories: [{ id: 1 }, { id: 2 }],
          },
        })],
        stubs: { 'form-page-template': false },
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly with single factory selection if there are not multiple factories available', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, fields: ['name', 'singleFactory'] },
      global: {
        plugins: [createPinia({}, { factory: { hasMultipleFactories: false } })],
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with single factory selection if there are not multiple factories available, but selectedGroupItemsCount is not 0', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, fields: ['name', 'singleFactory'], selectedGroupItemsCount: 1 },
      global: {
        plugins: [createPinia({}, { factory: { hasMultipleFactories: false } })],
        mocks,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('selectedGroup', () => {
    it('returns empty object if id does not exist in route query', () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: {} } },
        },
      });

      expect(wrapper.vm.selectedGroup).toEqual({});
    });

    it('returns empty object if namespace is checklistTemplate and id does not exist in checklistGroupsMap', () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'checklistTemplate' },
        global: {
          plugins: [createPinia({}, {
            checklistTemplate: {
              checklistGroupsMap: {
                1: {
                  id: 1, name: 'group 1', factoryIds: [], local: false,
                },
              },
            },
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: { id: 2 } } },
        },
      });

      expect(wrapper.vm.selectedGroup).toEqual({});
    });

    it('returns group object if namespace is checklistTemplate and id exists in checklistGroupsMap', () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'checklistTemplate' },
        global: {
          plugins: [createPinia({}, {
            checklistTemplate: {
              checklistGroupsMap: {
                1: {
                  id: 1, name: 'group 1', factoryIds: [], local: false,
                },
              },
            },
          })],
          mocks,
        },
      });

      expect(wrapper.vm.selectedGroup).toEqual({
        id: 1, name: 'group 1', factoryIds: [], local: false,
      });
    });

    it('returns empty object if id does not exist in commentGroupsWithAdminPermissionsMap', () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            comment: {
              commentGroupsWithAdminPermissionsMap: {
                2: {
                  id: 2, primaryName: 'comment-group2', name: 'group 2', factoryIds: [], local: false,
                },
              },
            },
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: { id: 3 } } },
        },
      });

      expect(wrapper.vm.selectedGroup).toEqual({});
    });

    it('returns group object if id exists in commentGroupsWithAdminPermissionsMap', () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            comment: {
              commentGroupsWithAdminPermissionsMap: {
                1: {
                  id: 1, primaryName: 'comment-group1', name: 'group 1', factoryIds: [], local: false,
                },
              },
            },
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks,
        },
      });

      expect(wrapper.vm.selectedGroup).toEqual({
        id: 1, primaryName: 'comment-group1', name: 'group 1', factoryIds: [], local: false,
      });
    });
  });

  test('that onGoBack calls router.push without isGroupEdit and id', () => {
    const wrapper = shallowMount(SettingsGroupEdit, {
      props: { ...propsDefault, namespace: 'comment' },
      global: {
        plugins: [createPinia()],
        stubs: { 'form-page-template': false },
        mocks: { ...router, $route: { query: { isGroupEdit: true, id: 1, factoryIds: [] } } },
      },
    });

    expect(wrapper.vm.$route.query).toEqual({ isGroupEdit: true, id: 1, factoryIds: [] });
    wrapper.vm.onGoBack();
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'commentOverview', query: { factoryIds: [] } });
  });

  describe('setTags', () => {
    it('calls fetchTags with correct parameters if namespace is comment', () => {
      const pinia = createPinia();
      const tagStore = useTagStore(pinia);
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'comment' },
        global: {
          plugins: [pinia],
          mocks,
        },
      });

      wrapper.vm.setTags();
      expect(tagStore.fetchTags).toHaveBeenCalledWith({ entity: [enabledTagEntities.COMMENT_GROUP] });
    });

    it('calls fetchTags with correct parameters if namespace is perfComment', () => {
      const pinia = createPinia();
      const tagStore = useTagStore(pinia);
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'perfComment' },
        global: {
          plugins: [pinia],
          mocks,
        },
      });

      wrapper.vm.setTags();
      expect(tagStore.fetchTags).toHaveBeenCalledWith({ entity: [enabledTagEntities.PERFORMANCE_COMMENT_GROUP] });
    });

    it('calls fetchTags with correct parameters if namespace is scrapReason', () => {
      const pinia = createPinia();
      const tagStore = useTagStore(pinia);
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'scrapReason' },
        global: {
          plugins: [pinia],
          mocks,
        },
      });

      wrapper.vm.setTags();
      expect(tagStore.fetchTags).toHaveBeenCalledWith({ entity: [enabledTagEntities.SCRAP_REASON_GROUP] });
    });

    it('does not call fetchTags if namespace is something else', () => {
      const pinia = createPinia({}, {
        factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
      });
      const tagStore = useTagStore(pinia);
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'otherNamespace' },
        global: {
          plugins: [pinia],
          mocks: { ...router, $route: { query: {} } },
        },
      });
      wrapper.vm.setTags();
      expect(tagStore.fetchTags).not.toHaveBeenCalled();
    });

    it('does not call fetchTags if tags are disabled', () => {
      const pinia = createPinia({}, { feature: { tagsEnabled: false } });
      const tagStore = useTagStore(pinia);
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault, namespace: 'comment' },
        global: {
          plugins: [pinia],
          mocks,
        },
      });

      wrapper.vm.setTags();
      expect(tagStore.fetchTags).not.toHaveBeenCalled();
    });
  });

  describe('selectedGroup watcher', () => {
    it('sets isRemovedGroup to false if route query id is missing', async () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: {} } },
        },
      });

      await wrapper.vm.$options.watch.selectedGroup.call(wrapper.vm, {});

      expect(wrapper.vm.isRemovedGroup).toBe(false);
    });

    it('sets isRemovedGroup to false if route query has id and selectedGroup is not empty', async () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: { id: 1 } } },
        },
      });

      await wrapper.vm.$options.watch.selectedGroup.call(wrapper.vm, { id: 1, name: 'group 1' });

      expect(wrapper.vm.isRemovedGroup).toBe(false);
    });

    it('sets isRemovedGroup to true if route query has id and selectedGroup is empty', async () => {
      const wrapper = shallowMount(SettingsGroupEdit, {
        props: { ...propsDefault },
        global: {
          plugins: [createPinia({}, {
            factory: { orderedWriteAccessFactories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }] },
          })],
          mocks: { ...router, $route: { query: { id: 1 } } },
        },
      });

      await wrapper.vm.$options.watch.selectedGroup.call(wrapper.vm, {});

      expect(wrapper.vm.isRemovedGroup).toBe(true);
    });
  });
});
