import { mount, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsGroupPanels from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import useProfileStore from '@/stores/profile';
const propsDefault = {
  groups: [
    {
      id: 1, name: 'Group1', itemsCount: 2, local: true, color: 'green',
    },
    {
      id: 2, name: 'Group2', itemsCount: 12, local: true, color: 'blue',
    },
    {
      id: 3, name: 'Group3', itemsCount: 123, local: false, color: 'red',
    },
  ],
  areFiltersEmpty: true,
  showDragIcon: true,
  showGlobalGroupsIcon: true,
};

const createWrapper = (mountFn, { propsOverrides = {}, highestRoleAllowsFn = () => true } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = highestRoleAllowsFn;

  const global = createGlobal({ pinia });

  return mountFn(SettingsGroupPanels, {
    props: { ...propsDefault, ...propsOverrides },
    global,
  });
};

describe('SettingsGroupPanels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper(mount);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly with empty groups', () => {
    const wrapper = createWrapper(mount, { propsOverrides: { groups: [] } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper(mount);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when showGlobalGroupsIcon is false', () => {
    const wrapper = createWrapper(mount, { propsOverrides: { showGlobalGroupsIcon: false } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when showGroupItemsCount is false', () => {
    const wrapper = createWrapper(mount, { propsOverrides: { showGroupItemsCount: false } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when showGroupItemsCount is false, but group is open', async () => {
    const wrapper = createWrapper(mount, { propsOverrides: { showGroupItemsCount: false } });
    await wrapper.setData({ openedPanels: [1] });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('onPanelOpened', async () => {
    const wrapper = createWrapper(shallowMount, { propsOverrides: { showGroupItemsCount: false } });

    expect(wrapper.vm.openedPanels).toEqual([]);
    wrapper.vm.onPanelOpened(1);
    expect(wrapper.emitted('on-panel-opened')[0][0]).toBe(1);
    expect(wrapper.vm.openedPanels).toEqual([1]);
    wrapper.vm.onPanelOpened(2);
    expect(wrapper.emitted('on-panel-opened')[1][0]).toBe(2);
    await wrapper.setData({ openedPanels: [1, 2] });
    wrapper.vm.onPanelOpened(2);
    expect(wrapper.emitted('on-panel-opened').length).toBe(2);
    expect(wrapper.vm.openedPanels).toEqual([1]);
    wrapper.vm.onPanelOpened(1);
    expect(wrapper.emitted('on-panel-opened').length).toBe(2);
    expect(wrapper.vm.openedPanels).toEqual([]);
  });

  describe('isGroupEditVisible', () => {
    it('returns false if canEditGroups prop is false', () => {
      const wrapper = createWrapper(shallowMount, { propsOverrides: { canEditGroups: false } });

      expect(wrapper.vm.isGroupEditVisible({})).toBe(false);
      expect(wrapper.vm.isGroupEditVisible({ local: true })).toBe(false);
      expect(wrapper.vm.isGroupEditVisible({ local: false })).toBe(false);
    });

    it('returns true if canEditGroups prop is true and group has no local prop', () => {
      const wrapper = createWrapper(shallowMount, { propsOverrides: { canEditGroups: true } });
      expect(wrapper.vm.isGroupEditVisible({})).toBe(true);
    });

    it('returns true if canEditGroups is true and user can edit global groups', () => {
      const wrapper = createWrapper(shallowMount, {
        propsOverrides: { canEditGroups: true },
        highestRoleAllowsFn: () => true,
      });

      expect(wrapper.vm.isGroupEditVisible({})).toBe(true);
      expect(wrapper.vm.isGroupEditVisible({ local: true })).toBe(true);
      expect(wrapper.vm.isGroupEditVisible({ local: false })).toBe(true);
    });

    it('returns correct result if canEditGroups is true and user can not edit global groups', () => {
      const wrapper = createWrapper(shallowMount, {
        propsOverrides: { canEditGroups: true },
        highestRoleAllowsFn: () => false,
      });

      expect(wrapper.vm.isGroupEditVisible({})).toBe(true);
      expect(wrapper.vm.isGroupEditVisible({ local: true })).toBe(true);
      expect(wrapper.vm.isGroupEditVisible({ local: false })).toBe(false);
    });
  });
});
