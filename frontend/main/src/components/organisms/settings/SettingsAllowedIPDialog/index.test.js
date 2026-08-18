import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import SettingsAllowedIPDialog from './index.vue';

import allowedIPsApi from '@/api/allowedIPsApi';
import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER } from '@/constants/userRoles';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/allowedIPsApi');

const defaultPiniaState = {
  genericDialog: {
    dialogData: {
      item: {},
      IPWhitelist: [],
      action: vi.fn(),
    },
  },
  genericNotification: {},
  profile: {
    visibleUserRoles: [
      { id: COMPANY_ADMIN, name: 'COMPANY_ADMIN' },
      { id: FACTORY_ADMIN, name: 'FACTORY_ADMIN' },
      { id: OFFICE_USER, name: 'OFFICE_USER' },
      { id: LINEVIEW_USER, name: 'LINEVIEW_USER' },
    ],
  },
};

const createGlobal = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.showFullscreenDialogs = false;
  return {
    plugins: [pinia],
  };
};

describe('SettingsAllowedIPDialog', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsAllowedIPDialog, {
      global: createGlobal(),
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when editing existing IP', async () => {
    const wrapper = shallowMount(SettingsAllowedIPDialog, {
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              item: { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
              IPWhitelist: [],
              action: vi.fn(),
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when creating new IP', async () => {
    const wrapper = shallowMount(SettingsAllowedIPDialog, {
      global: {
        ...createGlobal(),
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('ipAddressRules', () => {
    it('validates required IP address field', () => {
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      const rules = wrapper.vm.ipAddressRules;

      expect(rules[0]('')).toBe('Public IP address');
      expect(rules[0]('   ')).toBe('Public IP address');
      expect(rules[0]('192.168.1.1')).toBe(true);
    });

    it('accepts valid IPv4 addresses', () => {
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      const rules = wrapper.vm.ipAddressRules;

      expect(rules[1]('192.168.1.1')).toBe(true);
      expect(rules[1]('10.0.0.1')).toBe(true);
      expect(rules[1]('255.255.255.255')).toBe(true);
      expect(rules[1]('0.0.0.0')).toBe(true);
      expect(rules[1]('172.16.0.1')).toBe(true);
    });

    it('rejects invalid IPv4 addresses', () => {
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      const rules = wrapper.vm.ipAddressRules;

      expect(rules[1]('256.1.1.1')).toBe('Public IP not in correct format (IPv4)');
      expect(rules[1]('192.168.1')).toBe('Public IP not in correct format (IPv4)');
      expect(rules[1]('192.168.1.1.1')).toBe('Public IP not in correct format (IPv4)');
      expect(rules[1]('abc.def.ghi.jkl')).toBe('Public IP not in correct format (IPv4)');
      expect(rules[1]('192.168.-1.1')).toBe('Public IP not in correct format (IPv4)');
    });
  });

  test('that closeDialog calls Pinia genericDialog closeDialog', () => {
    const wrapper = shallowMount(SettingsAllowedIPDialog, {
      global: createGlobal(),
    });

    const genericDialogStore = useGenericDialogStore();
    const spy = vi.spyOn(genericDialogStore, 'closeDialog');
    wrapper.vm.closeDialog();
    expect(spy).toHaveBeenCalled();
  });

  describe('onApply', () => {
    it('calls action and closes dialog when form is valid', async () => {
      const actionMock = vi.fn();
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal({
          genericDialog: {
            dialogData: {
              item: {},
              IPWhitelist: [],
              action: actionMock,
            },
          },
        }),
      });

      wrapper.vm.formData = {
        ipAddress: '10.0.0.1',
        description: 'Test IP',
        roles: [COMPANY_ADMIN],
      };

      wrapper.vm.isFormValid = true;
      wrapper.vm.form = { validate: vi.fn().mockResolvedValue() };

      await wrapper.vm.onApply();

      expect(actionMock).toHaveBeenCalledWith(wrapper.vm.formData);
      const genericDialogStore = useGenericDialogStore();
      expect(genericDialogStore.closeDialog).toHaveBeenCalled();
    });

    it('shows error when IP already exists', async () => {
      const actionMock = vi.fn();
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal({
          genericDialog: {
            dialogData: {
              item: {},
              IPWhitelist: [
                { ipAddress: '10.0.0.1', description: 'Existing IP', roles: [COMPANY_ADMIN] },
              ],
              action: actionMock,
            },
          },
        }),
      });

      wrapper.vm.formData = {
        ipAddress: '10.0.0.1',
        description: 'Test IP',
        roles: [COMPANY_ADMIN],
      };

      wrapper.vm.isFormValid = true;
      wrapper.vm.form = { validate: vi.fn().mockResolvedValue() };

      await wrapper.vm.onApply();

      const genericNotificationStore = useGenericNotificationStore();
      expect(genericNotificationStore.notifyError).toHaveBeenCalledWith('{value} already exists');
      expect(actionMock).not.toHaveBeenCalled();
    });
  });

  describe('onMounted', () => {
    it('initializes formData with selected IP data', () => {
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal({
          genericDialog: {
            dialogData: {
              item: { id: 1, ipAddress: '192.168.1.1', description: 'test1', roles: [COMPANY_ADMIN] },
              IPWhitelist: [],
              action: vi.fn(),
            },
          },
        }),
      });

      expect(wrapper.vm.formData).toEqual({
        id: 1,
        ipAddress: '192.168.1.1',
        description: 'test1',
        roles: [COMPANY_ADMIN],
      });
      expect(wrapper.vm.originalIpAddress).toBe('192.168.1.1');
    });

    it('initializes with empty formData when creating new IP', () => {
      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      expect(wrapper.vm.formData).toEqual({});
      expect(wrapper.vm.originalIpAddress).toBe('');
    });
  });

  describe('getMyIP', () => {
    it('sets formData.ipAddress when API returns IP', async () => {
      const mockIP = '203.0.113.42';
      allowedIPsApi.getMyIP.mockResolvedValue(mockIP);

      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      await wrapper.vm.getMyIP();

      expect(allowedIPsApi.getMyIP).toHaveBeenCalled();
      expect(wrapper.vm.formData.ipAddress).toBe(mockIP);
    });

    it('sets formData.ipAddress to empty string when API returns null', async () => {
      allowedIPsApi.getMyIP.mockResolvedValue(null);

      const wrapper = shallowMount(SettingsAllowedIPDialog, {
        global: createGlobal(),
      });

      await wrapper.vm.getMyIP();

      expect(allowedIPsApi.getMyIP).toHaveBeenCalled();
      expect(wrapper.vm.formData.ipAddress).toBe('');
    });
  });
});
