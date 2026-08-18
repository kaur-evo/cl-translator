import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ShareDashboardDialog from './index.vue';

import {
  COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER, SYS_ADMIN,
} from '@/constants/userRoles';
import dashboardApi from '@/api/dashboardApi';
import {
  useGenericDialogStore, useGenericNotificationStore, useConfirmDialogStore,
} from '@/stores/index';

vi.mock('@/api/dashboardApi');

const defaultInitialState = {
  device: { screen: { width: 9999 } },
  dashboardConfig: {
    pages: [{ id: 1, name: 'tab1' }, { id: 2, name: 'tab2' }, { id: 3, name: 'tab3' }],
    widgets: [],
  },
  user: { users: [], loading: [] },
  factory: { factories: [] },
};

describe('ShareDashboardDialog', () => {
  it('renders', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })],
        stubs: { 'dialog-template': false },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if first page is visible', async () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })],
        stubs: { 'dialog-template': false },
      },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if second page is visible and users request is loading', async () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            user: { users: [], loading: ['loading'] },
          },
        })],
        stubs: { 'dialog-template': false },
      },
    });

    wrapper.vm.step = 2;

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if second page is visible and filteredUsersList length is more than 0', async () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            user: {
              users: [
                { username: 'test1@user', fullName: 'Test1 User', roles: { 0: COMPANY_ADMIN } },
                { username: 'test2@user', fullName: 'Test2 User', roles: { 0: COMPANY_ADMIN } },
              ],
              loading: [],
            },
          },
        })],
        stubs: { 'dialog-template': false },
      },
    });

    wrapper.vm.step = 2;

    await nextTick();
    expect(wrapper.vm.filteredUsersList.length).toBe(2);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if second page is visible and filteredUsersList length is 0', async () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            user: { users: [], loading: [] },
          },
        })],
        stubs: { 'dialog-template': false },
      },
    });

    wrapper.vm.step = 2;

    await nextTick();
    expect(wrapper.vm.filteredUsersList.length).toBe(0);
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isFirstPage', () => {
    it('returns false if step is 2', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
      });

      wrapper.vm.step = 2;

      expect(wrapper.vm.isFirstPage).toBe(false);
    });

    it('returns true if step is 1', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
      });

      wrapper.vm.step = 1;

      expect(wrapper.vm.isFirstPage).toBe(true);
    });
  });

  describe('isSecondPage', () => {
    it('returns false if step is 1', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
      });

      wrapper.vm.step = 1;

      expect(wrapper.vm.isSecondPage).toBe(false);
    });

    it('returns true if step is 2', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
      });

      wrapper.vm.step = 2;

      expect(wrapper.vm.isSecondPage).toBe(true);
    });
  });

  test('that visibleUsers returns users from store where System Admin and Lineview User are excluded', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            user: {
              users: [
                { username: 'test1@user', fullName: 'Test1 User', roles: { 0: COMPANY_ADMIN } },
                { username: 'test2@user', fullName: 'Test2 User', roles: { 1: FACTORY_ADMIN } },
                { username: 'test3@user', fullName: 'Test3 User', roles: { 2: OFFICE_USER } },
                { username: 'test4@user', fullName: 'Test4 User', roles: { 3: LINEVIEW_USER } },
                { username: 'test5@user', fullName: 'Test5 User', roles: { 0: SYS_ADMIN } },
              ],
              loading: [],
            },
          },
        })],
      },
    });

    expect(wrapper.vm.visibleUsers.length).toBe(3);
    expect(wrapper.vm.visibleUsers).toEqual([
      { username: 'test1@user', fullName: 'Test1 User', roles: { 0: COMPANY_ADMIN } },
      { username: 'test2@user', fullName: 'Test2 User', roles: { 1: FACTORY_ADMIN } },
      { username: 'test3@user', fullName: 'Test3 User', roles: { 2: OFFICE_USER } },
    ]);
  });

  test('that selectedTabWidgets returns widgets which pageIds are included in selectedTabIds array', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              widgets: [
                { id: 1, pageId: 11, config: { stationId: [1, 2, 3] } },
                { id: 2, pageId: 12, config: { stationId: [2, 4] } },
                { id: 3, pageId: 13, config: { stationId: [1, 5] } },
              ],
            },
          },
        })],
      },
    });

    wrapper.vm.selectedTabIds = [11, 13];

    expect(wrapper.vm.selectedTabWidgets.length).toBe(2);
    expect(wrapper.vm.selectedTabWidgets).toEqual([
      { id: 1, pageId: 11, config: { stationId: [1, 2, 3] } },
      { id: 3, pageId: 13, config: { stationId: [1, 5] } },
    ]);
  });

  test('that selectedTabStationIds returns unique stationIds from widgets that are in selected tabs', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            dashboardConfig: {
              ...defaultInitialState.dashboardConfig,
              widgets: [
                { id: 1, pageId: 11, config: { stationId: [1, 2, 3] } },
                { id: 2, pageId: 12, config: { stationId: [2, 4] } },
                { id: 3, pageId: 13, config: { stationId: [1, 5] } },
              ],
            },
          },
        })],
      },
    });

    wrapper.vm.selectedTabIds = [11, 13];

    expect(wrapper.vm.selectedTabStationIds.length).toBe(4);
    expect(wrapper.vm.selectedTabStationIds).toEqual([1, 2, 3, 5]);
  });

  test('that formattedVisibleUsers returns formatted visibleUsers list', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            ...defaultInitialState,
            user: {
              users: [
                { username: 'test1@user', roles: { 0: COMPANY_ADMIN } },
                { username: 'test2@user', roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } },
                { username: 'test3@user', roles: { 2: OFFICE_USER } },
              ],
              loading: [],
            },
          },
        })],
      },
    });

    expect(wrapper.vm.visibleUsers).toEqual([
      { username: 'test1@user', roles: { 0: COMPANY_ADMIN } },
      { username: 'test2@user', roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } },
      { username: 'test3@user', roles: { 2: OFFICE_USER } },
    ]);

    expect(wrapper.vm.formattedVisibleUsers).toEqual([
      { username: 'test1@user', roles: { 0: COMPANY_ADMIN }, formattedRoles: COMPANY_ADMIN },
      { username: 'test2@user', roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER }, formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}` },
      { username: 'test3@user', roles: { 2: OFFICE_USER }, formattedRoles: OFFICE_USER },
    ]);
  });

  describe('filteredUsersList', () => {
    const filteredUsersListInitialState = {
      ...defaultInitialState,
      user: {
        users: [
          {
            fullName: 'First', roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
          {
            fullName: 'Fourth', roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
          },
        ],
        loading: [],
      },
    };

    test('that formattedVisibleRoles returns formatted users', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
      });

      expect(wrapper.vm.formattedVisibleUsers.length).toBe(4);
      expect(wrapper.vm.formattedVisibleUsers).toEqual([
        {
          fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
        },
        {
          fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
        },
        {
          fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
        },
        {
          fullName: 'Fourth', formattedRoles: OFFICE_USER, roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
        },
      ]);
    });

    describe('search filter', () => {
      it('returns all users if search filter is empty', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.search = '';

        expect(wrapper.vm.filteredUsersList.length).toBe(4);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
          {
            fullName: 'Fourth', formattedRoles: OFFICE_USER, roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
          },
        ]);
      });

      it('returns users that include search filter input in their full name', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.search = 'ir';

        expect(wrapper.vm.filteredUsersList.length).toBe(2);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
        ]);
      });
    });

    describe('factory filter', () => {
      it('returns all users if factory filter is empty', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.factoryIds = [];

        expect(wrapper.vm.filteredUsersList.length).toBe(4);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
          {
            fullName: 'Fourth', formattedRoles: OFFICE_USER, roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
          },
        ]);
      });

      it('returns users that have permissions to factory ids in factory filter', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.factoryIds = [11];

        expect(wrapper.vm.filteredUsersList.length).toBe(3);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
        ]);
      });
    });

    describe('station filter', () => {
      it('returns all users if station filter is empty', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.stationIds = [];

        expect(wrapper.vm.filteredUsersList.length).toBe(4);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
          {
            fullName: 'Fourth', formattedRoles: OFFICE_USER, roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
          },
        ]);
      });

      it('returns users that have permissions to station ids in station filter', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.stationIds = [21];

        expect(wrapper.vm.filteredUsersList.length).toBe(3);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
        ]);
      });
    });

    describe('role filter', () => {
      it('returns all users if role filter is empty', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.roles = [];

        expect(wrapper.vm.filteredUsersList.length).toBe(4);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'First', formattedRoles: COMPANY_ADMIN, roles: { 0: COMPANY_ADMIN }, allowedFactories: [0], allowedStations: { 0: true },
          },
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
          {
            fullName: 'Fourth', formattedRoles: OFFICE_USER, roles: { 12: OFFICE_USER }, allowedFactories: [12], allowedStations: { 22: true },
          },
        ]);
      });

      it('returns filtered users if role filter is not empty', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.roles = [FACTORY_ADMIN];

        expect(wrapper.vm.filteredUsersList.length).toBe(2);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'Second', formattedRoles: FACTORY_ADMIN, roles: { 11: FACTORY_ADMIN }, allowedFactories: [11], allowedStations: { 0: true },
          },
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
        ]);
      });
    });

    describe('filteredUsersList -- all filters applied', () => {
      it('returns empty list if none of the users match with filter values', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.search = 'ir';
        wrapper.vm.filter.factoryIds = [11];
        wrapper.vm.filter.stationIds = [22];
        wrapper.vm.filter.roles = [OFFICE_USER];

        expect(wrapper.vm.filteredUsersList.length).toBe(0);
      });

      it('returns filtered users if some of the users match with filter values', () => {
        const wrapper = shallowMount(ShareDashboardDialog, {
          global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: filteredUsersListInitialState })] },
        });

        wrapper.vm.filter.search = 'ir';
        wrapper.vm.filter.factoryIds = [11];
        wrapper.vm.filter.stationIds = [21];
        wrapper.vm.filter.roles = [OFFICE_USER];

        expect(wrapper.vm.filteredUsersList.length).toBe(1);
        expect(wrapper.vm.filteredUsersList).toEqual([
          {
            fullName: 'Third', formattedRoles: `${FACTORY_ADMIN}, ${OFFICE_USER}`, roles: { 11: FACTORY_ADMIN, 13: OFFICE_USER }, allowedFactories: [11, 13], allowedStations: { 21: true, 23: true },
          },
        ]);
      });
    });
  });

  describe('onUpdateFilter', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
    });

    Object.keys(wrapper.vm.filter).forEach((key) => {
      it(`should update ${key} value`, () => {
        const newValue = typeof wrapper.vm.filter[key] === 'string' ? 'new value' : [1, 2];
        wrapper.vm.onUpdateFilter({ [key]: newValue });
        expect(wrapper.vm.filter[key]).toEqual(newValue);
      });
    });
  });

  test('that closeDialog calls closeDialog store method', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState });
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: { plugins: [pinia] },
    });

    wrapper.vm.closeDialog();

    const genericDialogStore = useGenericDialogStore();
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  test('that onBackClick sets step to 1 and sets selectedUserIds to empty array', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
    });

    wrapper.vm.step = 2;
    wrapper.vm.selectedUserIds = [1, 2, 3];

    expect(wrapper.vm.step).toBe(2);
    expect(wrapper.vm.selectedUserIds).toEqual([1, 2, 3]);
    wrapper.vm.onBackClick();
    expect(wrapper.vm.step).toBe(1);
    expect(wrapper.vm.selectedUserIds).toEqual([]);
  });

  test('that onContinueClick sets step to 2', () => {
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
    });

    wrapper.vm.step = 1;

    wrapper.vm.onContinueClick();
    expect(wrapper.vm.step).toBe(2);
  });

  test('that onShareClick calls openConfirmDialog with correct parameters', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState });
    const wrapper = shallowMount(ShareDashboardDialog, {
      global: { plugins: [pinia] },
    });

    await wrapper.vm.onShareClick();

    const confirmDialogStore = useConfirmDialogStore();
    expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'You are about to share your dashboard. This action cannot be undone. Do you want to proceed?',
      action: expect.any(Function),
      color: 'primary',
      confirmText: 'Share',
      cancelText: 'Cancel',
    });
  });

  describe('onShareDashboardTabs', () => {
    it('puts together request body from selected dashboards and receivers and shows success notification if shareDashboards request is successful', async () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          ...defaultInitialState,
          dashboardConfig: {
            pages: [{ id: 11, name: 'First Page' }, { id: 12, name: 'Second Page' }, { id: 13, name: 'Third Page' }],
            widgets: [{ id: 1, pageId: 11 }, { id: 2, pageId: 12 }, { id: 3, pageId: 13 }],
          },
          user: {
            users: [
              { username: 'test1@user', fullName: 'Test1 User', roles: { 0: COMPANY_ADMIN } },
              { username: 'test2@user', fullName: 'Test2 User', roles: { 0: COMPANY_ADMIN } },
            ],
            loading: [],
          },
        },
      });
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.selectedTabIds = [11, 13];
      wrapper.vm.selectedUserIds = ['test2@user'];

      await wrapper.vm.onShareDashboardTabs();
      expect(dashboardApi.shareDashboardTabs).toHaveBeenCalledWith({
        dashboard: {
          pages: [{ id: 11, name: 'First Page' }, { id: 13, name: 'Third Page' }],
          widgets: [{ id: 1, pageId: 11 }, { id: 3, pageId: 13 }],
        },
        receivers: ['test2@user'],
      });

      const genericNotificationStore = useGenericNotificationStore();
      const genericDialogStore = useGenericDialogStore();
      expect(genericNotificationStore.notifySuccess).toHaveBeenCalledWith('Shared successfully');
      expect(genericDialogStore.closeDialog).toHaveBeenCalled();
    });

    it('puts together request body from selected dashboards and receivers and shows error notification if shareDashboards request fails', async () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          ...defaultInitialState,
          dashboardConfig: {
            pages: [{ id: 11, name: 'First Page' }, { id: 12, name: 'Second Page' }, { id: 13, name: 'Third Page' }],
            widgets: [{ id: 1, pageId: 11 }, { id: 2, pageId: 12 }, { id: 3, pageId: 13 }],
          },
          user: {
            users: [
              { username: 'test1@user', fullName: 'Test1 User', roles: { 0: COMPANY_ADMIN } },
              { username: 'test2@user', fullName: 'Test2 User', roles: { 0: COMPANY_ADMIN } },
            ],
            loading: [],
          },
        },
      });
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.selectedTabIds = [11, 13];
      wrapper.vm.selectedUserIds = ['test2@user'];

      dashboardApi.shareDashboardTabs.mockRejectedValueOnce();

      await wrapper.vm.onShareDashboardTabs();
      expect(dashboardApi.shareDashboardTabs).toHaveBeenCalledWith({
        dashboard: {
          pages: [{ id: 11, name: 'First Page' }, { id: 13, name: 'Third Page' }],
          widgets: [{ id: 1, pageId: 11 }, { id: 3, pageId: 13 }],
        },
        receivers: ['test2@user'],
      });

      const genericNotificationStore = useGenericNotificationStore();
      expect(genericNotificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });
  });

  describe('isUserDisabled', () => {
    it('returns false if user is Company Admin', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultInitialState })] },
      });

      const user = { allowedStations: { 0: true }, roles: { 0: COMPANY_ADMIN } };

      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns false if user is Factory Admin and selectedTabStationIds includes all ids that are allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 22] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 0: true }, roles: { 31: FACTORY_ADMIN } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 22]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns true if user is Factory Admin and selectedTabStationIds has some ids that are not allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 23, 24] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 0: true }, roles: { 31: FACTORY_ADMIN } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 23, 24]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });

    it('returns false if user is Factory Admin + Office User and selectedTabStationIds includes all ids that are allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }, { id: 32, stations: [{ id: 24 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 22, 24] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 24: true }, roles: { 31: FACTORY_ADMIN, 32: OFFICE_USER } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 22, 24]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns true if user is Factory Admin + Office User and selectedTabStationIds has some ids that are not allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }, { id: 32, stations: [{ id: 24 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 23, 24] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 24: true }, roles: { 31: FACTORY_ADMIN, 32: OFFICE_USER } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 23, 24]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });

    it('returns true if user is Factory Admin + Office User and all selectedTabStationIds are not allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }, { id: 32, stations: [{ id: 24 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [23, 25] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 24: true }, roles: { 31: FACTORY_ADMIN, 32: OFFICE_USER } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([23, 25]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });

    it('returns false if user is Office User and selectedTabStationIds includes all ids that are allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 22] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 21: true, 22: true }, roles: { 31: OFFICE_USER } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 22]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns true if user is Office User and selectedTabStationIds has some ids that are not allowed for the user', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 23, 24] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 21: true, 22: true }, roles: { 31: OFFICE_USER } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 23, 24]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });

    it('returns false if user has no roles but selectedTabStationIds is empty', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
            },
          })],
        },
      });

      const user = { allowedStations: {}, roles: {} };

      wrapper.vm.selectedTabIds = [];

      expect(wrapper.vm.selectedTabStationIds).toEqual([]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns true if user has no roles and selectedTabStationIds has some ids', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [{ id: 1, pageId: 11, config: { stationId: [21, 23] } }],
              },
            },
          })],
        },
      });

      const user = { allowedStations: {}, roles: {} };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 23]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });

    it('returns false if user is Factory Admin and selectedTabStationIds includes all ids that are allowed for the user, even with overlapping station IDs', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [
                  { id: 1, pageId: 11, config: { stationId: [21, 22, 21] } },
                ],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 21: true, 22: true }, roles: { 31: FACTORY_ADMIN } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 22]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(false);
    });

    it('returns true if user is Factory Admin and selectedTabStationIds has some ids that are not allowed for the user, even with overlapping station IDs', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              factory: { factories: [{ id: 31, stations: [{ id: 21 }, { id: 22 }] }] },
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [
                  { id: 1, pageId: 11, config: { stationId: [21, 22, 23, 21] } },
                ],
              },
            },
          })],
        },
      });

      const user = { allowedStations: { 21: true, 22: true }, roles: { 31: FACTORY_ADMIN } };

      wrapper.vm.selectedTabIds = [11];

      expect(wrapper.vm.selectedTabStationIds).toEqual([21, 22, 23]);
      expect(wrapper.vm.isUserDisabled(user)).toBe(true);
    });
  });

  describe('calculateListHeight', () => {
    it('returns screen height minus the sum of other components height if showFullscreenDialogs is true', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          ...defaultInitialState,
          device: { screen: { width: 0 } },
        },
      });
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.$vuetify.display.height = 1000;
      // dialogHeightConstant - 1
      // Dialog header - 64px; Stepper height: 60px; Dialog footer - 60px; List paddings - 16px
      wrapper.vm.calculateListHeight();
      expect(wrapper.vm.listHeight).toBe('800px');
    });

    it('returns screen height minus the sum of other components height if showFullscreenDialogs is false', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          ...defaultInitialState,
          device: { screen: { width: 9999 } },
        },
      });
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.$vuetify.display.height = 1000;
      // dialogHeightConstant 0.9
      // Dialog header - 64px; Stepper height: 60px; Dialog footer - 60px; List paddings - 16px
      wrapper.vm.calculateListHeight();
      expect(wrapper.vm.listHeight).toBe('700px');
    });

    it('returns screen height minus the sum of other components height if showFullscreenDialogs is true in smaller screen', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          ...defaultInitialState,
          device: { screen: { width: 0 } },
        },
      });
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.$vuetify.display.smAndDown = true;
      wrapper.vm.$vuetify.display.height = 1000;
      // dialogHeightConstant - 1
      // Dialog header - 64px; Stepper height: 60px; Dialog footer - 52px; List paddings - 16px
      wrapper.vm.calculateListHeight();
      expect(wrapper.vm.listHeight).toBe('808px');
    });
  });

  describe('selectedTabFactoryIds', () => {
    it('returns unique factoryIds from widgets in selected tabs', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [
                  { id: 1, pageId: 11, config: { factoryId: [1, 2, 3] } },
                  { id: 2, pageId: 12, config: { factoryId: [2, 4] } },
                  { id: 3, pageId: 13, config: { factoryId: [1, 5] } },
                ],
              },
            },
          })],
        },
      });

      wrapper.vm.selectedTabIds = [11, 13];

      expect(wrapper.vm.selectedTabFactoryIds.length).toBe(4);
      expect(wrapper.vm.selectedTabFactoryIds).toEqual([1, 2, 3, 5]);
    });

    it('returns an empty array if no widgets are in selected tabs', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [
                  { id: 1, pageId: 11, config: { factoryId: [1, 2, 3] } },
                  { id: 2, pageId: 12, config: { factoryId: [2, 4] } },
                  { id: 3, pageId: 13, config: { factoryId: [1, 5] } },
                ],
              },
            },
          })],
        },
      });

      wrapper.vm.selectedTabIds = [];

      expect(wrapper.vm.selectedTabFactoryIds.length).toBe(0);
      expect(wrapper.vm.selectedTabFactoryIds).toEqual([]);
    });

    it('returns unique factoryIds even if widgets have overlapping factoryIds', () => {
      const wrapper = shallowMount(ShareDashboardDialog, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ...defaultInitialState,
              dashboardConfig: {
                ...defaultInitialState.dashboardConfig,
                widgets: [
                  { id: 1, pageId: 11, config: { factoryId: [1, 2, 3] } },
                  { id: 2, pageId: 12, config: { factoryId: [2, 3, 4] } },
                  { id: 3, pageId: 13, config: { factoryId: [3, 5] } },
                ],
              },
            },
          })],
        },
      });

      wrapper.vm.selectedTabIds = [11, 12, 13];

      expect(wrapper.vm.selectedTabFactoryIds.length).toBe(5);
      expect(wrapper.vm.selectedTabFactoryIds).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
