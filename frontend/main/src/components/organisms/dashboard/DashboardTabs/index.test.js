import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiCog, mdiShare, mdiPencil, mdiContentDuplicate, mdiDelete } from '@mdi/js';
import { nextTick } from 'vue';

import DashboardTabs from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { useDashboardConfigStore } from '@/stores/index';

const $route = {
  params: { tabId: 1 },
};

const defaultInitialState = {
  dashboardConfig: {
    pages: [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }, { id: 3, name: 'tab3' }],
    isPagesEdit: false,
    loading: [],
  },
  device: {
    isBrowserTabActive: true,
  },
  genericDialog: {
    isOpen: false,
  },
  profile: {
    highestUserRole: 'COMPANY_ADMIN',
  },
};

const createWrapper = (options = {}) => {
  const { piniaOptions, ...mountOptions } = options;
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: defaultInitialState,
    ...piniaOptions,
  });
  return shallowMount(DashboardTabs, {
    global: {
      plugins: [pinia],
      mocks: { $route },
      stubs: ['router-link', 'router-view'],
    },
    ...mountOptions,
  });
};

describe('DashboardTabs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:56.000Z'));

    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn().mockReturnValue(null) },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in small view', async () => {
    const wrapper = createWrapper({
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })],
        mocks: { $route },
        stubs: { 'main-app-toolbar': false },
      },
    });
    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in small view if dashboard sharing is not visible', async () => {
    const wrapper = createWrapper({
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            profile: { highestUserRole: 'OFFICE_USER' },
          },
        })],
        mocks: { $route },
        stubs: { 'main-app-toolbar': false },
      },
    });
    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if some tab has sharedAtISO', async () => {
    const wrapper = createWrapper({
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              pages: [
                { id: 1, name: 'tab1', sharedAtISO: '2020-01-29T12:34:56.000Z' },
                { id: 2, name: 'tab2', sharedAtISO: null },
              ],
            },
          },
        })],
        mocks: { $route },
        stubs: { 'draggable-tabs': false, draggable: false },
      },
    });
    wrapper.vm.$vuetify.display.smAndDown = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if isEditPages is true', async () => {
    const wrapper = createWrapper({
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              isPagesEdit: true,
            },
          },
        })],
        mocks: { $route },
        stubs: { 'draggable-tabs': false, draggable: false },
      },
    });
    wrapper.vm.$vuetify.display.smAndDown = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that interval is not set on mount if tabRotationState is false', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.interval).toBe(null);
  });

  test('that interval is added on onMouseMove', () => {
    const wrapper = createWrapper();

    wrapper.vm.onMouseMove();
    expect(wrapper.vm.interval).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.interval.cbFun).toBe(wrapper.vm.checkInterval);
    expect(wrapper.vm.interval.delay).toBe(50);
    const spy = vi.spyOn(wrapper.vm.interval, 'cbFun');
    const passedIntervals = 2;
    vi.advanceTimersByTime(passedIntervals * 50);
    expect(spy).toHaveBeenCalledTimes(passedIntervals);
  });

  test('that interval is cleared on unmount', () => {
    const wrapper = createWrapper();

    wrapper.vm.onMouseMove();
    expect(wrapper.vm.interval).toBeInstanceOf(CustomInterval);
    const spy = vi.spyOn(wrapper.vm.interval, 'cbFun');
    wrapper.unmount();
    expect(wrapper.vm.interval).toBe(null);
    const passedIntervals = 2;
    vi.advanceTimersByTime(passedIntervals * 50);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('that clicking edit page overflow calls cancelEditPagesFlow', async () => {
    const wrapper = createWrapper({
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            dashboardConfig: { ...defaultInitialState.dashboardConfig, isPagesEdit: true },
          },
        })],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    const spy = vi.spyOn(wrapper.vm, 'cancelEditPagesFlow');
    await wrapper.find('#page-edit-overflow').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('that tabIndex is set if route params has tabId', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState });
    const wrapper = createWrapper({
      global: {
        plugins: [pinia],
        mocks: { $route: { params: { tabId: 2 } } },
        stubs: ['router-link', 'router-view'],
      },
    });

    await flushPromises();

    expect(wrapper.vm.selectedTabIndex).toBe(1);
  });

  test('that toolbarMenuItems has tab settings and dashboard sharing actions', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.toolbarMenuItems).toHaveLength(2);
    expect(wrapper.vm.toolbarMenuItems).toEqual([
      {
        icon: mdiCog,
        name: 'Settings',
        action: expect.any(Function),
      },
      {
        icon: mdiShare,
        name: 'Share',
        action: expect.any(Function),
      },
    ]);
  });

  test('that tabEditMenuItems returns correct items', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.tabEditMenuItems).toEqual([
      { icon: mdiPencil, name: 'Rename', action: expect.any(Function) },
      { icon: mdiContentDuplicate, name: 'Duplicate', action: expect.any(Function) },
      { icon: mdiDelete, name: 'Delete', action: expect.any(Function) },
    ]);
  });

  describe('showShareDashboardBtn', () => {
    it('returns false if isEditPages is false and highestRoleAllows is false', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            profile: { highestUserRole: 'OFFICE_USER' },
          },
        },
      });

      expect(wrapper.vm.showShareDashboardBtn).toBe(false);
    });

    it('returns false if isEditPages is true and highestRoleAllows is true', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            dashboardConfig: { ...defaultInitialState.dashboardConfig, isPagesEdit: true },
            profile: { highestUserRole: 'COMPANY_ADMIN' },
          },
        },
      });

      expect(wrapper.vm.showShareDashboardBtn).toBe(false);
    });

    it('returns false if isEditPages is true and highestRoleAllows is false', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            dashboardConfig: { ...defaultInitialState.dashboardConfig, isPagesEdit: true },
            profile: { highestUserRole: 'OFFICE_USER' },
          },
        },
      });

      expect(wrapper.vm.showShareDashboardBtn).toBe(false);
    });

    it('returns true if isEditPages is false and highestRoleAllows is true', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            profile: { highestUserRole: 'COMPANY_ADMIN' },
          },
        },
      });

      expect(wrapper.vm.showShareDashboardBtn).toBe(true);
    });
  });

  test('that openDashboardSharingDialog calls openDialog with correct params', () => {
    const wrapper = createWrapper();

    const spy = vi.spyOn(wrapper.vm, 'openDialog');
    wrapper.vm.openDashboardSharingDialog();

    expect(spy).toHaveBeenCalledWith({
      component: expect.any(Object),
    });
  });

  test('that onDuplicateTab calls duplicatePageWithWidgets and closes dialog', async () => {
    const wrapper = createWrapper();
    const tab = { id: 1, name: 'tab1' };

    const openDialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
    const duplicatePageWithWidgetsSpy = vi.spyOn(wrapper.vm, 'duplicatePageWithWidgets');
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');

    wrapper.vm.onDuplicateTab(tab);

    const dialogConfig = openDialogSpy.mock.calls[0][0];
    await dialogConfig.onPrimaryAction(tab);

    expect(duplicatePageWithWidgetsSpy).toHaveBeenCalledWith(tab);
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  describe('openTabSettings', () => {
    it('calls duplicatePageWithWidgets and closeDialog when isTabDuplication is true', async () => {
      const wrapper = createWrapper();
      const tab = { id: 1, name: 'tab1' };
      const isTabDuplication = true;

      const openDialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
      const duplicatePageWithWidgetsSpy = vi.spyOn(wrapper.vm, 'duplicatePageWithWidgets');
      const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');

      wrapper.vm.openTabSettings();

      const dialogConfig = openDialogSpy.mock.calls[0][0];
      await dialogConfig.onPrimaryAction(tab, isTabDuplication);

      expect(duplicatePageWithWidgetsSpy).toHaveBeenCalledWith(tab);
      expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('calls onTabSave when isTabDuplication is false', async () => {
      const wrapper = createWrapper();
      const tab = { id: 1, name: 'tab1' };
      const isTabDuplication = false;

      const openDialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
      const onTabSaveSpy = vi.spyOn(wrapper.vm, 'onTabSave');

      wrapper.vm.openTabSettings();

      const dialogConfig = openDialogSpy.mock.calls[0][0];
      await dialogConfig.onPrimaryAction(tab, isTabDuplication);

      expect(onTabSaveSpy).toHaveBeenCalledWith(tab);
    });
  });

  describe('onTabSave', () => {
    it('calls savePage with existing tab and sets selectedTabIndex to changed tab index, plus it calls closeDialog in the end', () => {
      const wrapper = createWrapper();
      const spySavePage = vi.spyOn(wrapper.vm, 'savePage');
      const spyCloseDialog = vi.spyOn(wrapper.vm, 'closeDialog');
      wrapper.vm.onTabSave({ id: 2, name: 'tab2' });

      expect(spySavePage).toHaveBeenCalledWith({ id: 2, name: 'tab2' });
      expect(wrapper.vm.selectedTabIndex).toBe(1);
      expect(spyCloseDialog).toHaveBeenCalled();
    });

    it('calls savePage with new tab and calls closeDialog in the end', () => {
      const wrapper = createWrapper();
      const spySavePage = vi.spyOn(wrapper.vm, 'savePage').mockImplementation((tab) => {
        const dashboardConfigStore = useDashboardConfigStore();
        dashboardConfigStore.pages.push(tab);
      });
      const spyCloseDialog = vi.spyOn(wrapper.vm, 'closeDialog');
      wrapper.vm.onTabSave({ name: 'tab4' });

      expect(spySavePage).toHaveBeenCalledWith({ name: 'tab4' });
      expect(spyCloseDialog).toHaveBeenCalled();
    });
  });

  describe('selectedTabIndex watcher', () => {
    it('calls only onPageChange if selected tab does not have sharedAtISO', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              pages: [
                { id: 1, name: 'tab1', sharedAtISO: null },
                { id: 2, name: 'tab2', sharedAtISO: '2020-01-29T12:34:56.000Z' },
              ],
            },
          },
        },
      });

      const onPageChangeSpy = vi.spyOn(wrapper.vm, 'onPageChange');
      const saveDashboardConfigSpy = vi.spyOn(wrapper.vm, 'saveDashboardConfig');

      wrapper.vm.$options.watch.selectedTabIndex.call(wrapper.vm, 0);

      expect(saveDashboardConfigSpy).not.toHaveBeenCalled();
      expect(onPageChangeSpy).toHaveBeenCalledWith(1);
    });

    it('calls saveDashboardConfig and onPageChange if selected tab has sharedAtISO and sets it to null', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              pages: [
                { id: 1, name: 'tab1', sharedAtISO: null },
                { id: 2, name: 'tab2', sharedAtISO: '2020-01-29T12:34:56.000Z' },
              ],
            },
          },
        },
      });

      const onPageChangeSpy = vi.spyOn(wrapper.vm, 'onPageChange');
      const saveDashboardConfigSpy = vi.spyOn(wrapper.vm, 'saveDashboardConfig');

      wrapper.vm.$options.watch.selectedTabIndex.call(wrapper.vm, 1);

      expect(saveDashboardConfigSpy).toHaveBeenCalledWith({
        pages: [{ id: 1, name: 'tab1', sharedAtISO: null }, { id: 2, name: 'tab2', sharedAtISO: null }],
        showToast: false,
      });
      expect(onPageChangeSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('pages watcher', () => {
    it('does not change selectedTabIndex if watcher is triggered with empty previous tabs array', () => {
      const wrapper = createWrapper();
      const previousTabs = [];
      const newTabs = [{ id: 1, name: 'tab1' }];

      expect(wrapper.vm.selectedTabIndex).toBe(0);
      wrapper.vm.$options.watch.pages.call(wrapper.vm, newTabs, previousTabs);
      expect(wrapper.vm.selectedTabIndex).toBe(0);
    });

    it('sets selectedTabIndex to last tab index if new tab is added', () => {
      const wrapper = createWrapper();
      const previousTabs = [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }];
      const newTabs = [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }, { id: 3, name: 'tab3' }];

      expect(wrapper.vm.selectedTabIndex).toBe(0);
      wrapper.vm.$options.watch.pages.call(wrapper.vm, newTabs, previousTabs);
      expect(wrapper.vm.selectedTabIndex).toBe(2);
    });

    it('sets selectedTabIndex to last tab index if some tab is removed', () => {
      const wrapper = createWrapper();
      const previousTabs = [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }, { id: 3, name: 'tab3' }];
      const newTabs = [{ id: 1, name: 'tab1' }, { id: 3, name: 'tab3' }];

      expect(wrapper.vm.selectedTabIndex).toBe(0);
      wrapper.vm.$options.watch.pages.call(wrapper.vm, newTabs, previousTabs);
      expect(wrapper.vm.selectedTabIndex).toBe(1);
    });
  });

  test('that tabsWithDisplayInfo returns each tab with newIndicatorShownUntil property', () => {
    const wrapper = createWrapper({
      piniaOptions: {
        initialState: {
          ...defaultInitialState,
          dashboardConfig: {
            ...defaultInitialState.dashboardConfig,
            pages: [{ id: 1, name: 'tab1', sharedAtISO: '2019-12-30T12:34:56.000Z' }, { id: 2, name: 'tab2', sharedAtISO: null }],
          },
        },
      },
    });

    expect(wrapper.vm.tabsWithDisplayInfo).toEqual([
      {
        id: 1, name: 'tab1', sharedAtISO: '2019-12-30T12:34:56.000Z', newIndicatorShownUntil: '2020-01-29T12:34:56.000Z',
      },
      {
        id: 2, name: 'tab2', sharedAtISO: null, newIndicatorShownUntil: null,
      },
    ]);
  });
});
