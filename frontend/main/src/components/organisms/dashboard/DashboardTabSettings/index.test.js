import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiContentDuplicate, mdiDelete } from '@mdi/js';

import DashboardTabSettings from './index.vue';

import { useDashboardConfigStore } from '@/stores/index';

const createWrapper = (pages = [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }]) => shallowMount(DashboardTabSettings, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          dashboardConfig: {
            pages,
            isEditPages: false,
          },
          genericDialog: {
            onPrimaryAction: vi.fn(),
          },
          device: {
            isMobileView: () => false,
            screenWidth: () => 1920,
          },
        },
      }),
    ],
  },
});

describe('DashboardTabSettings', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that tabEditMenuItems returns correct items', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.tabEditMenuItems).toEqual([
      { icon: mdiPencil, name: 'Rename', action: expect.any(Function) },
      { icon: mdiContentDuplicate, name: 'Duplicate', action: expect.any(Function) },
      { icon: mdiDelete, name: 'Delete', action: expect.any(Function) },
    ]);
  });

  test('that onSaveClick calls onPrimaryAction', async () => {
    const wrapper = createWrapper();

    const onPrimaryAction = vi.spyOn(wrapper.vm, 'onPrimaryAction');
    wrapper.vm.$refs.form.validate = () => {
      wrapper.vm.valid = true;
    };

    await wrapper.vm.onSaveClick({ id: 1, name: 'tab' });
    expect(onPrimaryAction).toHaveBeenCalledWith({ id: 1, name: 'tab' }, wrapper.vm.isTabDuplication);
  });

  test('that setIsPagesEdit is called with false and isTabDuplication is set to false when component is unmounted', () => {
    const wrapper = createWrapper();

    wrapper.vm.isTabDuplication = true;
    const setIsPagesEditSpy = vi.spyOn(wrapper.vm, 'setIsPagesEdit');
    wrapper.unmount();
    expect(setIsPagesEditSpy).toHaveBeenCalledWith(false);
    expect(wrapper.vm.isTabDuplication).toBe(false);
  });

  describe('onAddTab', () => {
    it('adds a new empty tab when called without arguments and sets selectedTabIndex to the last tab', async () => {
      const wrapper = createWrapper([{ id: 1, name: 'tab1' }]);

      await wrapper.vm.onAddTab();
      expect(wrapper.vm.tabs).toHaveLength(2);
      expect(wrapper.vm.tabs[1]).toEqual({ name: '' });
      expect(wrapper.vm.selectedTabIndex).toBe(wrapper.vm.tabs.length - 1);
    });

    it('sets isTabDuplication to true, adds a new tab with name "Copy of {tab.name}" when called with a tab argument and sets selectedTabIndex to the last tab', async () => {
      const wrapper = createWrapper([{ id: 1, name: 'tab1' }]);

      await wrapper.vm.onAddTab({ id: 1, name: 'tab1' });
      expect(wrapper.vm.isTabDuplication).toBe(true);
      expect(wrapper.vm.tabs).toHaveLength(2);
      expect(wrapper.vm.tabs[1]).toEqual({ id: 1, name: 'Copy of tab1' });
      expect(wrapper.vm.selectedTabIndex).toBe(wrapper.vm.tabs.length - 1);
    });
  });

  test('that onDeleteTab calls startEditPagesFlow and initDeletePageFlow with tab', () => {
    const wrapper = createWrapper();
    const dashboardConfigStore = useDashboardConfigStore();

    wrapper.vm.onDeleteTab({ id: 1, name: 'tab1' });
    expect(dashboardConfigStore.startEditPagesFlow).toHaveBeenCalled();
    expect(dashboardConfigStore.initDeletePageFlow).toHaveBeenCalledWith({ id: 1, name: 'tab1' });
  });
});
