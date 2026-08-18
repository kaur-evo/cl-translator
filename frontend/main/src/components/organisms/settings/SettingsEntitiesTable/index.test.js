import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import SettingsEntitiesTable from './index.vue';

import useProfileStore from '@/stores/profile';
import useFilterbarStore from '@/stores/filterbar';

const routerPush = vi.fn();

const $router = {
  push: routerPush,
};

const $route = {
  params: {},
  query: '',
};

const propsDefault = {
  entityName: 'users',
  headers: [
    { text: 'Header1', value: 'item1' },
    { text: 'Header2', value: 'item2' },
    { text: 'Header3', value: 'item3' },
  ],
  items: [
    { item1: 'Item name 1' },
    { item2: 'Item name 2' },
    { item3: 'Item name 3' },
  ],
  width: 900,
};

const createWrapper = ({ propsOverrides = {}, highestRoleAllowsFn = () => true } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { filterbar: { requestFilterState: {} } },
  });
  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = highestRoleAllowsFn;
  useFilterbarStore(pinia);

  return shallowMount(SettingsEntitiesTable, {
    props: { ...propsDefault, ...propsOverrides },
    global: {
      plugins: [pinia],
      mocks: { $router, $route },
    },
  });
};

describe('SettingsEntitiesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when it is non-empty group', async () => {
    const wrapper = createWrapper({ propsOverrides: { group: '123' } });
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('onRowClick when action is not given with props', () => {
    const wrapper = createWrapper();
    wrapper.vm.onRowClick({ item: { id: 123 } });

    expect(routerPush).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith({ name: 'usersEdit', params: { id: 123 }, query: '' });
  });

  test('onRowClick when action is given with props', () => {
    const onRowClick = vi.fn();
    const wrapper = createWrapper({ propsOverrides: { rowClickAction: onRowClick } });

    wrapper.vm.onRowClick({ item: { id: 123 } });

    expect(routerPush).toHaveBeenCalledTimes(0);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith({ id: 123 });
  });

  test('that onLinkClick emits link-click event', async () => {
    const wrapper = createWrapper();
    const item = { id: 123 };
    const col = { value: 'item1' };
    wrapper.vm.onLinkClick(item, col);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('link-click')).toBeTruthy();
    expect(wrapper.emitted('link-click').length).toBe(1);
    expect(wrapper.emitted('link-click')[0]).toEqual([item, col]);
  });

  describe('emptyViewBtnText', () => {
    it('returns addEntityBtnText if isGlobal is true and highest role allows editing global group', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: true, addEntityBtnText: 'Add Entity' },
        highestRoleAllowsFn: () => true,
      });
      expect(wrapper.vm.emptyViewBtnText).toBe('Add Entity');
    });

    it('returns addEntityBtnText if isGlobal is false and highest role allows editing group', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: false, addEntityBtnText: 'Add Entity' },
        highestRoleAllowsFn: () => true,
      });
      expect(wrapper.vm.emptyViewBtnText).toBe('Add Entity');
    });

    it('returns addEntityBtnText if isGlobal is false and highest role does not allow editing group', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: false, addEntityBtnText: 'Add Entity' },
        highestRoleAllowsFn: () => false,
      });
      expect(wrapper.vm.emptyViewBtnText).toBe('Add Entity');
    });

    it('returns empty string if isGlobal is true and highest role does not allow editing global group', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: true, addEntityBtnText: 'Add Entity' },
        highestRoleAllowsFn: () => false,
      });
      expect(wrapper.vm.emptyViewBtnText).toBe('');
    });
  });

  describe('emptyViewDescription', () => {
    it('returns correct description for station entity', () => {
      const wrapper = createWrapper({ propsOverrides: { entityName: 'station' } });
      expect(wrapper.vm.emptyViewDescription).toBe('You can move stations between groups by opening the station edit view and changing the station group value');
    });

    it('returns correct description if group is global and global group edit is not allowed', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: true },
        highestRoleAllowsFn: () => false,
      });
      expect(wrapper.vm.emptyViewDescription).toBe('Contact your company administrator to add items.');
    });

    it('returns correct description if group is global and global group edit is allowed', () => {
      const wrapper = createWrapper({
        propsOverrides: { isGlobal: true },
        highestRoleAllowsFn: () => true,
      });
      expect(wrapper.vm.emptyViewDescription).toBe('Start adding new values');
    });

    it('returns correct description if group is not global', () => {
      const wrapper = createWrapper({ propsOverrides: { isGlobal: false } });
      expect(wrapper.vm.emptyViewDescription).toBe('Start adding new values');
    });
  });
});
