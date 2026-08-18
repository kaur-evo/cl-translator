import { shallowMount } from '@vue/test-utils';
import { mdiFormatListGroup, mdiFormatListBulleted, mdiMonitor } from '@mdi/js';

import SettingsEntitiesOverview from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

const $router = {
  push: vi.fn(),
};

const $route = {
  name: 'entityNameOverview',
  query: {
    isGroupEdit: false,
  },
};

const defaultPiniaState = {
  filterbar: {
    requestFilterState: {
      factoryId: [], stationId: [], groupId: [], search: '',
    },
    calculatedFilterConfig: new Map([
      ['factoryId', { type: 'multi-select', label: 'Factory', options: [] }],
      ['stationId', { type: 'multi-select', label: 'Station', options: [] }],
      ['groupId', { type: 'multi-select', label: 'Group', options: [] }],
      ['search', { type: 'search', label: 'Search' }],
    ]),
  },
  device: {
    screen: { width: 2600, height: 1200 },
  },
  routeModule: {},
  settingsSideMenu: {
    isCollapsed: false,
  },
  factory: {
    factories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }],
    loading: [],
  },
  feature: {
    tags: true,
  },
};

const global = createGlobal({
  router: { $router, $route },
  piniaOptions: { initialState: defaultPiniaState },
});

const createGlobalWithFilterbar = (requestFilterState) => createGlobal({
  piniaOptions: {
    initialState: {
      ...defaultPiniaState,
      filterbar: { ...defaultPiniaState.filterbar, requestFilterState },
    },
  },
});

const createWrapper = (options) => shallowMount(SettingsEntitiesOverview, {
  shallow: true,
  global,
  ...options,
});

const propsDefault = {
  fields: ['field1', 'field2'],
  groups: [{ id: 1, name: 'group1', factoryIds: [1, 2] }, { id: 2, name: 'group2', factoryIds: [2] }],
  items: [
    {
      id: 1, name: 'item1', groupId: 2, factoryIds: [2],
    },
    {
      id: 2, name: 'item2', groupId: 1, factoryIds: [1, 2],
    },
  ],
  languageTextEntity: 'languageEntity',
  nameField: 'primaryName',
  namespace: 'nameSpace',
  entityName: 'entityName',
  saveActionName: 'saveAction',
  header: 'Overview header',
  btnText: 'Primary btn',
  secondaryBtnText: 'Secondary btn',
};

describe('SettingsEntitiesOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if it is group edit', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: {
        ...global,
        stubs: { 'settings-group-edit': false, 'form-page-template': false },
        mocks: {
          $route: { query: { isGroupEdit: true } },
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is devices overview without any items', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: [], entityName: 'device', emptyViewDescriptionOverride: '' },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
        mocks: {
          $route: { ...$route, name: 'deviceOverview' },
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is not group edit and there are no items and no groups', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: [], groups: [] },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is not group edit and there are no items', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: [] },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is not group edit, but list view', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is not group edit, but group view', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
      data() {
        return {
          toggleBtnValue: 1,
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is group view with no groups and items added', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: [], groups: [] },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
      data() {
        return {
          toggleBtnValue: 1,
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is group view with no items added', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, items: [] },
      global: {
        ...global,
        stubs: { 'settings-overview-wrapper': false },
      },
      data() {
        return {
          toggleBtnValue: 1,
        };
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('filteredEntities', () => {
    const items = [
      { id: 1, name: 'test1', groupId: 2, factoryIds: [2] },
      { id: 2, name: 'test2', groupId: 1, factoryIds: [1, 2] },
    ];

    it('returns all items if useBackendFiltering is true', () => {
      const wrapper = shallowMount(SettingsEntitiesOverview, {
        props: { ...propsDefault, useBackendFiltering: true, items },
        global: createGlobalWithFilterbar({ factoryId: [1], stationId: [], groupId: [], search: 'Test' }),
      });

      expect(wrapper.vm.filteredEntities).toEqual(items);
    });

    it('returns filtered items if useBackendFiltering is false', () => {
      const wrapper = shallowMount(SettingsEntitiesOverview, {
        props: { ...propsDefault, useBackendFiltering: false, items },
        global: createGlobalWithFilterbar({ factoryId: [1], stationId: [], groupId: [], search: 'Test' }),
      });

      expect(wrapper.vm.filteredEntities).toEqual([{ id: 2, name: 'test2', groupId: 1, factoryIds: [1, 2] }]);
    });
  });

  test('that filters are empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.areFiltersEmpty).toBeTruthy();
  });

  test('that filters are not empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: createGlobalWithFilterbar({ factoryId: [1], stationId: [11], groupId: [2], search: 'Test' }),
    });

    expect(wrapper.vm.areFiltersEmpty).toBeFalsy();
    expect(wrapper.vm.search).toBe('Test');
    expect(wrapper.vm.factoryFilter).toEqual([1]);
    expect(wrapper.vm.requestFilterState.stationId).toEqual([11]);
    expect(wrapper.vm.groupFilter).toEqual([2]);
  });

  test('that groups are filtered correctly, when filters are empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.filteredGroups).toEqual([{
      id: 1, name: 'group1', itemsCount: 1, factoryIds: [1, 2],
    }, {
      id: 2, name: 'group2', itemsCount: 1, factoryIds: [2],
    }]);
  });

  test('that groups are filtered correctly, when group filter is not empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: createGlobalWithFilterbar({ groupId: [2] }),
    });

    expect(wrapper.vm.filteredGroups).toEqual([{
      id: 2, name: 'group2', itemsCount: 1, factoryIds: [2],
    }]);
  });

  test('that groups are filtered correctly when search is not empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: createGlobalWithFilterbar({ search: '2' }),
    });

    expect(wrapper.vm.filteredGroups).toEqual([{
      id: 1, name: 'group1', itemsCount: 1, factoryIds: [1, 2],
    }]);
  });

  test('that groups are filtered correctly when factory filter is not empty', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, groups: [{ id: 1, name: 'group1', factoryIds: [1, 2] }, { id: 2, name: 'group2', factoryIds: [2] }, { id: 3, name: 'group3', factoryIds: [1] }] },
      global: createGlobalWithFilterbar({ factoryId: [1], groupId: [] }),
    });

    expect(wrapper.vm.filteredGroups).toEqual([
      {
        id: 1, name: 'group1', factoryIds: [1, 2], itemsCount: 1,
      },
      {
        id: 3, name: 'group3', factoryIds: [1], itemsCount: 0,
      },
    ]);
  });

  test('that groups are filtered correctly when station filter is not empty', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        items: [
          {
            id: 1, name: 'item1', groupId: 2, factoryIds: [2], stationIds: [1],
          },
          {
            id: 2, name: 'item2', groupId: 1, factoryIds: [1, 2], stationIds: [2],
          },
        ],
      },
      global: createGlobalWithFilterbar({ stationId: [1] }),
    });

    expect(wrapper.vm.filteredGroups).toEqual([{
      id: 2, name: 'group2', factoryIds: [2], itemsCount: 1,
    }]);
  });

  test('that groups are filtered correctly if group and factory filters are applied', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, groups: [{ id: 1, name: 'group1', factoryIds: [1, 2] }, { id: 2, name: 'group2', factoryIds: [2] }, { id: 3, name: 'group3', factoryIds: [1] }] },
      global: createGlobalWithFilterbar({ factoryId: [1], groupId: [1] }),
    });

    expect(wrapper.vm.filteredGroups).toEqual([
      {
        id: 1, name: 'group1', factoryIds: [1, 2], itemsCount: 1,
      },
    ]);
  });

  test('onPrimaryBtnClicked in case action is not passed with props', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      global: { ...global },
    });

    wrapper.vm.onPrimaryBtnClicked(12);

    expect($router.push).toHaveBeenCalledTimes(1);
    expect($router.push).toBeCalledWith({ name: 'entityNameEdit', query: { itemGroupId: 12, isGroupEdit: false } });
  });

  test('onPrimaryBtnClicked in case action is passed with props', () => {
    const primaryBtnAction = vi.fn();
    const wrapper = createWrapper({
      props: { ...propsDefault, primaryBtnAction },
      global: { ...global },
    });

    wrapper.vm.onPrimaryBtnClicked();

    expect($router.push).toHaveBeenCalledTimes(0);
    expect(primaryBtnAction).toHaveBeenCalledTimes(1);
  });

  test('getTableItems when items have groupId', () => {
    const wrapper = createWrapper({
      propsData: { ...propsDefault },
      global: { ...global },
    });

    expect(wrapper.vm.getTableItems(1)).toEqual([
      {
        id: 2, name: 'item2', groupId: 1, factoryIds: [1, 2],
      },
    ]);
    expect(wrapper.vm.getTableItems(2)).toEqual([
      {
        id: 1, name: 'item1', groupId: 2, factoryIds: [2],
      },
    ]);
    expect(wrapper.vm.getTableItems(3)).toEqual([]);
  });

  test('getTableItems when items do not have groupId', () => {
    const items = [
      {
        id: 1, name: 'item1', stationIds: [1, 2],
      },
      {
        id: 2, name: 'item2', stationIds: [1],
      },
      {
        id: 2, name: 'item2', stationIds: [2],
      },
    ];
    const wrapper = createWrapper({
      propsData: { ...propsDefault, items },
    });

    expect(wrapper.vm.getTableItems(1)).toEqual([
      {
        id: 1, name: 'item1', stationIds: [1, 2],
      },
      {
        id: 2, name: 'item2', stationIds: [1],
      },
    ]);
    expect(wrapper.vm.getTableItems(2)).toEqual([
      {
        id: 1, name: 'item1', stationIds: [1, 2],
      },
      {
        id: 2, name: 'item2', stationIds: [2],
      },
    ]);
    expect(wrapper.vm.getTableItems(3)).toEqual([]);
  });

  test('that onLinkClick emits link-click event', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const item = { id: 123 };
    const col = { value: 'item1' };
    wrapper.vm.onLinkClick(item, col);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('link-click')).toBeTruthy();
    expect(wrapper.emitted('link-click').length).toBe(1);
    expect(wrapper.emitted('link-click')[0]).toEqual([item, col]);
  });

  describe('toggleButtonItems', () => {
    it('returns toggle button items from toggleBtnItems prop if it is not an empty array', () => {
      const toggleBtnItems = [{ text: 'Btn1', icon: mdiFormatListGroup }, { text: 'Btn2', icon: mdiFormatListBulleted }];
      const wrapper = createWrapper({
        props: { ...propsDefault, hasGroupView: true, toggleBtnItems },
      });

      expect(wrapper.vm.toggleButtonItems).toEqual(toggleBtnItems);
    });

    it('returns items list that are referring to group and list view if toggleBtnItems prop is empty array and hasGroupView is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, hasGroupView: true, toggleBtnItems: [] },
      });

      expect(wrapper.vm.toggleButtonItems).toEqual([
        { text: 'Groups', icon: mdiFormatListGroup, id: builtInViewTypes.GROUPS },
        { text: 'List', icon: mdiFormatListBulleted, id: builtInViewTypes.LIST },
      ]);
    });

    it('returns items list that are referring to group and list view if toggleBtnItems prop is empty array, hasGroupView is true and entityName is position', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, hasGroupView: true, toggleBtnItems: [], entityName: 'position' },
      });

      expect(wrapper.vm.toggleButtonItems).toEqual([
        { text: 'Stations', icon: mdiMonitor, id: builtInViewTypes.GROUPS },
        { text: 'List', icon: mdiFormatListBulleted, id: builtInViewTypes.LIST },
      ]);
    });

    it('returns empty array if toggleBtnItems prop is empty array and hasGroupView is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, hasGroupView: false, toggleBtnItems: [] },
      });

      expect(wrapper.vm.toggleButtonItems).toEqual([]);
    });
  });

  describe('selectedGroupItemsCount', () => {
    it('returns 0 if route query does not have id', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: {
          ...global,
          mocks: {
            $route: { name: 'entityNameOverview', query: {} },
          },
        },
      });

      expect(wrapper.vm.selectedGroupItemsCount).toBe(0);
    });

    it('returns count of items in the selected group', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          items: [
            {
              id: 1, name: 'item1', groupId: 2, factoryIds: [2],
            },
            {
              id: 2, name: 'item2', groupId: 1, factoryIds: [1, 2],
            },
            {
              id: 3, name: 'item3', groupId: 1, factoryIds: [1],
            },
          ],
        },
        global: {
          ...global,
          mocks: {
            $route: { name: 'entityNameOverview', query: { id: 1 } },
          },
        },
      });

      expect(wrapper.vm.selectedGroupItemsCount).toBe(2);
    });
  });

  describe('onAddGroup', () => {
    it('calls router push with current query, isGroupEdit and group id if group is given', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: {
          ...global,
          mocks: {
            $router,
            $route: { name: 'entityNameOverview', query: { factoryIds: [1, 2, 3] } },
          },
        },
      });

      wrapper.vm.onAddGroup({ id: 123, name: 'group1' });
      expect($router.push).toHaveBeenCalledWith({ query: { factoryIds: [1, 2, 3], id: 123, isGroupEdit: true } });
    });

    it('calls router push with current query and isGroupEdit if group is not given', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: {
          ...global,
          mocks: {
            $router,
            $route: { name: 'entityNameOverview', query: { factoryIds: [1, 2, 3] } },
          },
        },
      });

      wrapper.vm.onAddGroup();
      expect($router.push).toHaveBeenCalledWith({ query: { factoryIds: [1, 2, 3], isGroupEdit: true } });
    });
  });

  describe('emptyViewImgUrl', () => {
    it('returns img url from props if it exists and filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, emptyViewImgOverride: 'machine-locations' },
      });

      expect(wrapper.vm.emptyViewImgUrl).toBe('machine-locations');
    });

    it('returns settings-view if filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      expect(wrapper.vm.emptyViewImgUrl).toBe('settings-view');
    });

    it('returns no-filter-results if filters are not empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: createGlobalWithFilterbar({ factoryId: [1], groupId: [2], search: 'Test' }),
      });

      expect(wrapper.vm.emptyViewImgUrl).toBe('no-filter-results');
    });
  });

  describe('emptyViewHeader', () => {
    it('returns No user actions if entityName includes ActivityLogs', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, entityName: 'settingsActivityLogs' },
      });

      expect(wrapper.vm.emptyViewHeader).toBe('No user actions');
    });

    it('returns header from props if it exists and filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, emptyViewHeaderOverride: 'Define fault locations of the machines' },
      });

      expect(wrapper.vm.emptyViewHeader).toBe('Define fault locations of the machines');
    });

    it('returns Nothing to display if filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      expect(wrapper.vm.emptyViewHeader).toBe('Nothing to display');
    });

    it('returns No results if filters are not empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: createGlobalWithFilterbar({ factoryId: [1], groupId: [2], search: 'Test' }),
      });

      expect(wrapper.vm.emptyViewHeader).toBe('No results');
    });
  });

  describe('emptyViewDescription', () => {
    it('returns description from props if it exists and filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, emptyViewDescriptionOverride: 'Link reasons to specific machine locations to track exactly where issues occur' },
      });

      expect(wrapper.vm.emptyViewDescription).toBe('Link reasons to specific machine locations to track exactly where issues occur');
    });

    it('returns correct description if filters are empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      expect(wrapper.vm.emptyViewDescription).toBe('Start adding new values');
    });

    it('returns correct description if filters are not empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: createGlobalWithFilterbar({ factoryId: [1], groupId: [2], search: 'Test' }),
      });

      expect(wrapper.vm.emptyViewDescription).toBe('Please try again with other settings.');
    });
  });
});
