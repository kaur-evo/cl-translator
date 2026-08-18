import { flushPromises, shallowMount } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiDelete, mdiAlert } from '@mdi/js';

import SettingsAllowedIPsOverview from './index.vue';

import allowedIPsApi from '@/api/allowedIPsApi';
import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER } from '@/constants/userRoles';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock('@/api/allowedIPsApi', () => ({
  default: {
    getAllowedIPs: vi.fn(),
    saveAllowedIPs: vi.fn(),
    getMyIP: vi.fn(),
  },
}));

const $route = {
  name: 'allowedIPsOverview',
};

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    profile: {
      visibleUserRoles: overrides.visibleUserRoles || [],
    },
    genericDialog: {},
    genericNotification: {},
    confirmDialog: {},
  },
});

describe('SettingsAllowedIPsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    allowedIPsApi.getAllowedIPs.mockResolvedValue([
      { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
      { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
    ]);
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: { 'settings-security-wrapper': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if allowedIPs is empty', () => {
    allowedIPsApi.getAllowedIPs.mockResolvedValue([]);
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: { 'settings-security-wrapper': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that cardListButtons returns correct list', () => {
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.vm.cardListButtons).toEqual([
      {
        icon: mdiPencil,
        text: 'Edit',
        tooltip: 'Edit',
        action: expect.any(Function),
      },
      {
        icon: mdiDelete,
        text: 'Delete',
        tooltip: 'Delete',
        action: expect.any(Function),
      },
    ]);
  });

  describe('getSubtitleKeyValuePairs', () => {
    it('returns correct key value pairs for item that has all roles selected', () => {
      const pinia = createPinia({
        visibleUserRoles: [
          { id: COMPANY_ADMIN, name: 'COMPANY_ADMIN' }, { id: FACTORY_ADMIN, name: 'FACTORY_ADMIN' }, { id: OFFICE_USER, name: 'OFFICE_USER' }, { id: LINEVIEW_USER, name: 'LINEVIEW_USER' },
        ],
      });
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      const item = { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER] };
      const result = wrapper.vm.getSubtitleKeyValuePairs(item);

      expect(result).toEqual([
        { key: 'Roles', value: 'All' },
        { key: 'Description', value: 'test1' },
      ]);
    });

    it('returns correct key value pairs for item that has some roles selected', () => {
      const pinia = createPinia({
        visibleUserRoles: [
          { id: COMPANY_ADMIN, name: 'COMPANY_ADMIN' }, { id: FACTORY_ADMIN, name: 'FACTORY_ADMIN' }, { id: OFFICE_USER, name: 'OFFICE_USER' }, { id: LINEVIEW_USER, name: 'LINEVIEW_USER' },
        ],
      });
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      const item = { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [COMPANY_ADMIN, OFFICE_USER] };
      const result = wrapper.vm.getSubtitleKeyValuePairs(item);

      expect(result).toEqual([
        { key: 'Roles', value: 'COMPANY_ADMIN, OFFICE_USER' },
        { key: 'Description', value: 'test2' },
      ]);
    });
  });

  test('that onEdit calls genericDialogStore.openDialog with correct dialog config', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [pinia],
        mocks: { $route },
      },
    });

    const genericDialogStore = useGenericDialogStore();
    const item = { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] };
    wrapper.vm.onEdit({ item });

    expect(genericDialogStore.openDialog).toHaveBeenCalledWith({
      component: expect.any(Object),
      data: {
        item,
        IPWhitelist: wrapper.vm.clonedAllowedIPs,
        action: expect.any(Function),
      },
      allowFullscreen: true,
    });
  });

  test('that onDelete removes correct IP from clonedAllowedIPs', async () => {
    allowedIPsApi.getAllowedIPs.mockResolvedValue([
      { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
      { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
    ]);
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    await flushPromises();

    wrapper.vm.onDelete({ index: 0 });

    expect(wrapper.vm.clonedAllowedIPs).toEqual([
      { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
    ]);
  });

  describe('haveIPsChanged', () => {
    it('returns false when no changes have been made', async () => {
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      expect(wrapper.vm.haveIPsChanged).toBe(false);
    });

    it('returns true when IP is added', async () => {
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      wrapper.vm.clonedAllowedIPs.push({ id: 3, ipAddress: '192.168.1.3', description: 'test3', roles: [FACTORY_ADMIN] });

      expect(wrapper.vm.haveIPsChanged).toBe(true);
    });

    it('returns true when IP is deleted', async () => {
      allowedIPsApi.getAllowedIPs.mockResolvedValue([
        { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
        { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
      ]);
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      wrapper.vm.clonedAllowedIPs.splice(0, 1);

      expect(wrapper.vm.haveIPsChanged).toBe(true);
    });

    it('returns true when IP is modified', async () => {
      allowedIPsApi.getAllowedIPs.mockResolvedValue([
        { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
        { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
      ]);
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      wrapper.vm.clonedAllowedIPs[0].description = 'modified description';

      expect(wrapper.vm.haveIPsChanged).toBe(true);
    });
  });

  describe('onCancelClick', () => {
    it('calls router.push directly when no changes have been made', async () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      wrapper.vm.onCancelClick();

      expect(router.push).toHaveBeenCalledWith({ name: 'securityOverview' });
    });

    it('calls confirmDialogStore.openConfirmDialog when changes have been made', async () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);
      allowedIPsApi.getAllowedIPs.mockResolvedValue([
        { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
        { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
      ]);
      const pinia = createPinia();
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      await flushPromises();

      const confirmDialogStore = useConfirmDialogStore();
      wrapper.vm.clonedAllowedIPs[0].description = 'modified';

      wrapper.vm.onCancelClick();

      expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalledWith({
        title: 'Confirmation',
        text: 'You are about to exit without saving changes. Do you want to save changes?',
        action: expect.any(Function),
        closeAction: expect.any(Function),
        confirmText: 'Save',
        cancelText: 'Don\'t save',
        color: 'primary',
      });
    });

    it('does not call openConfirmDialog and calls router.push when leaveWithoutChangesConfirmed is true even with changes', async () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);
      allowedIPsApi.getAllowedIPs.mockResolvedValue([
        { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
        { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
      ]);
      const pinia = createPinia();
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      await flushPromises();

      const confirmDialogStore = useConfirmDialogStore();
      wrapper.vm.clonedAllowedIPs[0].description = 'modified';
      wrapper.vm.leaveWithoutChangesConfirmed = true;

      wrapper.vm.onCancelClick();

      expect(confirmDialogStore.openConfirmDialog).not.toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'securityOverview' });
    });
  });

  describe('onSave', () => {
    it('calls confirmDialogStore.openConfirmDialog with confirmation dialog config', () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const pinia = createPinia();
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      const confirmDialogStore = useConfirmDialogStore();

      wrapper.vm.onSave();

      expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalledWith({
        title: 'Confirmation',
        text: 'Do you want Evocon to only be accessible from the specified IPs? Changes will take effect immediately.',
        action: expect.any(Function),
        primaryIcon: mdiAlert,
        color: 'secondary',
        confirmText: 'Yes, save',
        cancelText: 'Cancel',
      });
    });

    it('calls saveAllowedIPs API, sets leaveWithoutChangesConfirmed to true, and calls router.push when action is executed', async () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const pinia = createPinia();
      const wrapper = shallowMount(SettingsAllowedIPsOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      await flushPromises();

      const confirmDialogStore = useConfirmDialogStore();

      wrapper.vm.onSave();

      const confirmDialogConfig = confirmDialogStore.openConfirmDialog.mock.calls[0][0];
      await confirmDialogConfig.action();

      expect(allowedIPsApi.saveAllowedIPs).toHaveBeenCalledWith(wrapper.vm.clonedAllowedIPs);
      expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(true);
      expect(router.push).toHaveBeenCalledWith({ name: 'securityOverview' });
    });
  });

  test('that onMounted fetches allowedIPs and copies to clonedAllowedIPs', async () => {
    allowedIPsApi.getAllowedIPs.mockResolvedValue([
      { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
      { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
    ]);
    const wrapper = shallowMount(SettingsAllowedIPsOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    await flushPromises();

    expect(allowedIPsApi.getAllowedIPs).toHaveBeenCalled();
    expect(wrapper.vm.clonedAllowedIPs).toEqual([
      { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
      { id: 2, ipAddress: '192.168.1.2', description: 'test2', roles: [OFFICE_USER] },
    ]);
  });
});
