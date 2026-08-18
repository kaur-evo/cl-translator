import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiStar } from '@mdi/js';

import index from './index.vue';

import logApi from '@/api/logApi';
import { useDeviceStore } from '@/stores/index';

vi.mock('@/api/logApi', () => ({
  default: {
    logEvent: vi.fn(),
  },
}));

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const propsDefault = {
  item: { id: 1, label: 'Label', icon: mdiStar },
  value: true,
  activeValue: 0,
  activeKey: 'id',
  labelKey: 'label',
  iconKey: 'icon',
  activeColor: 'primary',
};

describe('SecondaryNavDrawerItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as collapsed', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, collapsed: true },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onListItemClick', () => {
    const baseItem = { id: 'baseItemId', label: 'Label', icon: mdiStar };

    it('emits click event when item has no subItems', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, item: { ...baseItem } },
        global: { plugins: [createPinia()] },
      });

      const event = { stopPropagation: vi.fn() };
      wrapper.vm.onListItemClick(wrapper.vm.item, event);
      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')[0][0]).toStrictEqual(baseItem);
    });

    it('calls stopPropagation in mobile view when item has subItems', () => {
      const pinia = createPinia();
      const deviceStore = useDeviceStore(pinia);
      deviceStore.isMobileView = true;

      const wrapper = shallowMount(index, {
        props: { ...propsDefault, item: { ...baseItem, subItems: [{ id: 2 }] } },
        global: { plugins: [pinia] },
      });

      const event = { stopPropagation: vi.fn() };
      wrapper.vm.onListItemClick(wrapper.vm.item, event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('calls $router.push, emits update:collapsed and update:opened-drawer-items when openedDrawerItems does not include item.id', () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault, item: { ...baseItem, subItems: [{ id: 2 }] }, collapsed: true, openedDrawerItems: ['otherId'],
        },
        global: { plugins: [createPinia()], mocks: { $router: { push: vi.fn() } } },
      });

      wrapper.vm.$vuetify.display.mdAndDown = false;
      const event = { stopPropagation: vi.fn() };
      wrapper.vm.onListItemClick(wrapper.vm.item, event);
      expect(wrapper.vm.$router.push).toHaveBeenCalled();
      expect(wrapper.vm.openedDrawerItems).not.toContain(baseItem.id);
      expect(wrapper.emitted('update:opened-drawer-items')).toBeTruthy();
      expect(wrapper.emitted('update:opened-drawer-items')[0][0]).toBe(baseItem.id);
      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
      expect(wrapper.emitted('update:collapsed')[0][0]).toBe(false);
    });

    it('calls $router.push, emits update:collapsed, but not update:opened-drawer-items when openedDrawerItems includes item.id', () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault, item: { ...baseItem, subItems: [{ id: 2 }] }, collapsed: true, openedDrawerItems: [baseItem.id],
        },
        global: { plugins: [createPinia()], mocks: { $router: { push: vi.fn() } } },
      });

      wrapper.vm.$vuetify.display.mdAndDown = false;
      const event = { stopPropagation: vi.fn() };
      wrapper.vm.onListItemClick(wrapper.vm.item, event);
      expect(wrapper.vm.$router.push).toHaveBeenCalled();
      expect(wrapper.vm.openedDrawerItems).toContain(baseItem.id);
      expect(wrapper.emitted('update:opened-drawer-items')).toBeFalsy();
      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
      expect(wrapper.emitted('update:collapsed')[0][0]).toBe(false);
    });

    it('emits update:opened-drawer-items when collapsed is false, mdAndDown is true and activeValue is equal to item.id', () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault, item: { ...baseItem, subItems: [{ id: 2 }] }, collapsed: false, activeValue: baseItem.id,
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.$vuetify.display.mdAndDown = true;
      const event = { stopPropagation: vi.fn() };
      wrapper.vm.onListItemClick(wrapper.vm.item, event);
      expect(wrapper.emitted('update:opened-drawer-items')).toBeTruthy();
      expect(wrapper.emitted('update:opened-drawer-items')[0][0]).toBe(baseItem.id);
    });
  });

  describe('onSubItemClick', () => {
    it('does not emit update:collapsed event when breakpoint is not mdAndDown', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, collapsed: true },
        global: { plugins: [createPinia()] },
      });
      const subItem = { id: 'subItem1', label: 'Sub Item 1' };

      wrapper.vm.$vuetify.display.mdAndDown = false;
      wrapper.vm.onSubItemClick(subItem.id);
      expect(wrapper.emitted('update:collapsed')).toBeFalsy();
    });

    it('emits update:collapsed event when breakpoint is mdAndDown', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, collapsed: true },
        global: { plugins: [createPinia()] },
      });
      const subItem = { id: 'subItem1', label: 'Sub Item 1' };

      wrapper.vm.$vuetify.display.mdAndDown = true;
      wrapper.vm.onSubItemClick(subItem.id);
      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
      expect(wrapper.emitted('update:collapsed')[0][0]).toBe(true);
    });

    it('does not call logApi.logEvent when activeValue is not activitylogs', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, activeValue: 'other' },
        global: { plugins: [createPinia()] },
      });
      const subItem = { id: 'subItem1', label: 'Sub Item 1' };

      wrapper.vm.onSubItemClick(subItem.id);
      expect(logApi.logEvent).not.toHaveBeenCalled();
    });

    it('calls logApi.logEvent with correct payload when activeValue is activitylogs', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, activeValue: 'activitylogs' },
        global: { plugins: [createPinia()] },
      });
      const subItem = { id: 'subItem1', label: 'Sub Item 1' };

      wrapper.vm.onSubItemClick(subItem.id);
      expect(logApi.logEvent).toHaveBeenCalledWith([{
        type: 'activity log side menu selection',
        message: `Selected from side menu: ${subItem.id}`,
      }]);
    });
  });
});
