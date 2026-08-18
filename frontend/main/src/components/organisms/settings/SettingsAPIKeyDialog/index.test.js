import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import SettingsAPIKeyDialog from './index.vue';

import useDeviceStore from '@/stores/device';
import { COMPANY_ADMIN, FACTORY_ADMIN } from '@/constants/userRoles';

const defaultPiniaState = {
  genericDialog: {
    dialogData: {},
  },
  user: {
    users: [
      { username: 'test@user', fullName: 'Test User', roles: { 1: COMPANY_ADMIN } },
      { username: 'test2@user', fullName: 'Test2 User', roles: { 1: COMPANY_ADMIN } },
    ],
  },
  profile: {
    currentUser: { username: 'current@user', fullName: 'Current User', roles: { 1: COMPANY_ADMIN } },
    highestUserRole: COMPANY_ADMIN,
  },
  APIKeys: {
    APIKeys: [],
  },
  device: {
    screen: { width: 1920, height: 1080 },
  },
  routeModule: { query: {} },
};

const createGlobal = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  });
  useDeviceStore(pinia).isMobileView = false;
  return {
    plugins: [pinia],
    stubs: { 'form-dialog-template': false },
  };
};

describe('SettingsAPIKeyDialog', () => {
  it('renders', () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal(),
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal(),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if users selection is visible', async () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal(),
    });

    wrapper.vm.showUsersSelection = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that usersInSelection includes current user', () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal(),
    });

    expect(wrapper.vm.usersInSelection.find((el) => el.username === 'current@user')).toBeTruthy();
  });

  test('that usersInSelection includes just current user for FACTORY_ADMIN', () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal({
        profile: {
          currentUser: { username: 'current@user', fullName: 'Current User', roles: { 1: FACTORY_ADMIN } },
          highestUserRole: FACTORY_ADMIN,
        },
      }),
    });

    expect(wrapper.vm.usersInSelection).toEqual([{ username: 'current@user', fullName: 'Current User', roles: { 1: FACTORY_ADMIN } }]);
  });
  it('renders correctly for FACTORY_ADMIN', async () => {
    const wrapper = mount(SettingsAPIKeyDialog, {
      shallow: true,
      global: createGlobal({
        profile: {
          currentUser: { username: 'current@user', fullName: 'Current User', roles: { 1: FACTORY_ADMIN } },
          highestUserRole: FACTORY_ADMIN,
        },
      }),
    });

    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
  describe('APIKeyRights', () => {
    it('returns correct value for COMPANY_ADMIN', () => {
      const wrapper = mount(SettingsAPIKeyDialog, {
        shallow: true,
        global: createGlobal(),
      });

      expect(wrapper.vm.APIKeyRights).toEqual([{ value: false, name: 'Custom reports', hidden: false }, { value: true, name: 'User rights' }]);
    });

    it('returns correct value for FACTORY_ADMIN', () => {
      const wrapper = mount(SettingsAPIKeyDialog, {
        shallow: true,
        global: createGlobal({
          profile: {
            currentUser: { username: 'current@user', fullName: 'Current User', roles: { 1: FACTORY_ADMIN } },
            highestUserRole: FACTORY_ADMIN,
          },
        }),
      });

      expect(wrapper.vm.APIKeyRights).toEqual([{ value: false, name: 'Custom reports', hidden: true }, { value: true, name: 'User rights' }]);
    });
  });
});
