/* eslint-disable sonarjs/no-hardcoded-passwords */
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsUserEdit from './index.vue';

import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';

const $router = {
  push: vi.fn(),
};

const defaultUsersList = [
  {
    fullName: 'Full Name',
    roles: { 1: 'FACTORY_ADMIN' },
    username: 'test@user',
    language: 'en',
    email: 'test@email.com',
    allowedStations: { 1: true },
    lineviewTimeRestrictionValue: 0,
    lineviewTimeRestrictionType: DAYS,
    lineviewLanguages: [],
  },
  {
    fullName: 'Shift View User',
    roles: { 1: 'LINEVIEW_USER' },
    username: 'test@lineviewuser',
    email: 'testlineview@email.com',
    allowedStations: { 1: true },
    lineviewTimeRestrictionValue: 10,
    lineviewTimeRestrictionType: DAYS,
    lineviewLanguages: ['et', 'en'],
    password: '',
    confirmPassword: '',
  },
  {
    fullName: 'Shift View User Vol 2',
    roles: { 1: 'LINEVIEW_USER' },
    username: 'test@lineviewuserVol2',
    email: 'testlineviewvol2@email.com',
    allowedStations: { 1: true },
    lineviewTimeRestrictionValue: 10,
    lineviewTimeRestrictionType: SHIFTS,
    lineviewLanguages: ['et', 'en', 'lv'],
    password: 'Test123!',
    confirmPassword: 'Test123!',
  },
  {
    fullName: 'Company admin',
    roles: { 1: 'COMPANY_ADMIN' },
    username: 'test@companyadmin',
    language: 'en',
    email: 'testcompanyadmin@email.com',
    allowedStations: { 1: true },
    lineviewTimeRestrictionValue: 0,
    lineviewTimeRestrictionType: DAYS,
    lineviewLanguages: [],
  },
  {
    fullName: 'Office user',
    roles: { 1: 'OFFICE_USER' },
    username: 'test@officeuser',
    language: 'en',
    email: 'testofficeuser@email.com',
    allowedStations: { 1: true },
    lineviewTimeRestrictionValue: 0,
    lineviewTimeRestrictionType: DAYS,
    lineviewLanguages: [],
  },
];

const defaultPiniaInitialState = {
  user: {
    users: defaultUsersList,
    loading: [],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
    highestUserRole: 'COMPANY_ADMIN',
  },
  securityProfile: {
    securityProfiles: [],
  },
  feature: {
    securitySettings: true,
  },
};

let pinia;

describe('SettingsUserEdit', () => {
  beforeEach(() => {
    pinia = createTestingPinia({ initialState: defaultPiniaInitialState });
  });

  test('that beforeRouteLeave calls promptSavingUserRightsChanges when haveUserRightsChanged is true and leaveWithoutChangesConfirmed is false', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      computed: {
        haveUserRightsChanged() {
          return true;
        },
      },
      data() {
        return {
          leaveWithoutChangesConfirmed: false,
        };
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'promptSavingUserRightsChanges');
    const { beforeRouteLeave } = wrapper.vm.$options;
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('that beforeRouteLeave doesnt call promptSavingUserRightsChanges when haveUserRightsChanged is false and leaveWithoutChangesConfirmed is false', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      computed: {
        haveUserRightsChanged() {
          return false;
        },
      },
      data() {
        return {
          leaveWithoutChangesConfirmed: false,
        };
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'promptSavingUserRightsChanges');
    const { beforeRouteLeave } = wrapper.vm.$options;
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('that beforeRouteLeave doesnt call promptSavingUserRightsChanges when haveUserRightsChanged is true and leaveWithoutChangesConfirmed is true', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      computed: {
        haveUserRightsChanged() {
          return true;
        },
      },
      data() {
        return {
          leaveWithoutChangesConfirmed: true,
        };
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'promptSavingUserRightsChanges');
    const { beforeRouteLeave } = wrapper.vm.$options;
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('that beforeRouteLeave doesnt call promptSavingUserRightsChanges when haveUserRightsChanged is false and leaveWithoutChangesConfirmed is true', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      computed: {
        haveUserRightsChanged() {
          return false;
        },
      },
      data() {
        return {
          leaveWithoutChangesConfirmed: true,
        };
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'promptSavingUserRightsChanges');
    const { beforeRouteLeave } = wrapper.vm.$options;
    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('that leaveWithoutChangesConfirmed is false by default', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(false);
  });

  it('has preferences form if role is shiftview user', async () => {
    const $route = { params: { id: 'test@lineviewuser' } };
    // form-page-template stub renders slots so inner elements are accessible under shallowMount.
    const formPageTemplateStub = { template: '<div><slot name="primary-segment" /><slot name="secondary-segment" /><slot name="actions" /></div>' };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
        stubs: { 'form-page-template': formPageTemplateStub },
      },
    });
    await flushPromises();
    expect(wrapper.find('#lineview-user-preferences-form').exists()).toBe(true);
  });

  it('doesnt have preferences form if role is factory admin', async () => {
    const $route = { params: { id: 'test@user' } };
    const formPageTemplateStub = { template: '<div><slot name="primary-segment" /><slot name="secondary-segment" /><slot name="actions" /></div>' };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
        stubs: { 'form-page-template': formPageTemplateStub },
      },
    });
    await flushPromises();
    expect(wrapper.find('#lineview-user-preferences-form').exists()).toBe(false);
  });

  it('doesnt have preferences form if role is company admin', async () => {
    const $route = { params: { id: 'test@companyadmin' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    await flushPromises();
    expect(wrapper.find('#lineview-user-preferences-form').exists()).toBe(false);
  });

  it('doesnt have preferences form if role is office user', async () => {
    const $route = { params: { id: 'test@officeuser' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    await flushPromises();
    expect(wrapper.find('#lineview-user-preferences-form').exists()).toBe(false);
  });

  test('that haveUserRightsChanged is false if creating a new user and no roles have been added', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
  });

  test('that haveUserRightsChanged is true if creating a new user and roles have been added', () => {
    const $route = { params: {} };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
    wrapper.vm.formData.roles = { 0: 'COMPANY_ADMIN' };
    expect(wrapper.vm.haveUserRightsChanged).toBe(true);
  });

  test('that haveUserRightsChanged is true when editing a user and roles has changed', () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
    wrapper.vm.formData.roles = { 0: 'COMPANY_ADMIN' };
    expect(wrapper.vm.haveUserRightsChanged).toBe(true);
  });

  test('that haveUserRightsChanged is true when editing a user and allowedStations has changed', () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
    wrapper.vm.formData.allowedStations = { 1: false };
    expect(wrapper.vm.haveUserRightsChanged).toBe(true);
  });

  test('that haveUserRightsChanged is true when editing a user and lineviewTimeRestrictionValue has changed', () => {
    const $route = { params: { id: 'test@lineviewuser' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
    wrapper.vm.formData.lineviewTimeRestrictionValue = 5;
    wrapper.vm.formData.lineviewTimeRestrictionType = DAYS;
    expect(wrapper.vm.haveUserRightsChanged).toBe(true);
  });

  test('that haveUserRightsChanged is false when editing a user and roles, allowedStations and lineviewTimeRestrictionValue have not changed', () => {
    const $route = { params: { id: 'test@lineviewuser' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    expect(wrapper.vm.haveUserRightsChanged).toBe(false);
  });

  test('that promptSavingUserRightsChanges calls openConfirmDialog method', () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.promptSavingUserRightsChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('that onSave calls saveUser if form is valid', async () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    const saveUser = vi.fn();
    wrapper.vm.saveUser = saveUser;
    wrapper.vm.primaryValid = true;
    wrapper.vm.secondaryValid = true;
    await wrapper.vm.onSave();
    expect(saveUser).toHaveBeenCalledTimes(1);
  });

  test('that onSave doesnt call saveProduct if form is not valid', async () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
    });
    const saveUser = vi.fn();
    wrapper.vm.primaryValid = true;
    wrapper.vm.secondaryValid = false;
    await wrapper.vm.onSave();
    expect(saveUser).toHaveBeenCalledTimes(0);
  });

  test('that onSave sets leaveWithoutChangesConfirmed to true if saving was successful', async () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      data: () => ({
        leaveWithoutChangesConfirmed: false,
      }),
    });
    wrapper.vm.saveUser = () => ({ username: 'test@user' });
    wrapper.vm.primaryValid = true;
    wrapper.vm.secondaryValid = true;

    expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(false);
    await wrapper.vm.onSave(false);
    expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(true);
  });

  test('that onSave doesnt set leaveWithoutChangesConfirmed to true if saving was not successful', async () => {
    const $route = { params: { id: 'test@user' } };
    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router },
      },
      data: () => ({
        leaveWithoutChangesConfirmed: false,
      }),
    });
    wrapper.vm.saveUser = () => ({});
    wrapper.vm.validate = () => {
      wrapper.vm.valid = true;
    };

    expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(false);
    await wrapper.vm.onSave(false);
    expect(wrapper.vm.leaveWithoutChangesConfirmed).toBe(false);
  });

  describe('usernameRule, current user has @evocon email', () => {
    let wrapper;
    beforeEach(() => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          profile: {
            currentUser: { roles: { 0: 'COMPANY_ADMIN' }, email: 'user@evocon.com' },
            highestUserRole: 'COMPANY_ADMIN',
          },
        },
      });
      wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: {} }, $router },
        },
      });
    });

    it('has error if username is empty', () => {
      wrapper.setData({ formData: { username: '' } });
      expect(wrapper.vm.usernameRule).toBe('Please enter {fieldName}');
    });

    it('has error if username includes evocon, but email doesnt', () => {
      wrapper.setData({ formData: { username: 'test@evocon.com', email: 'test@smthelse.com' } });
      expect(wrapper.vm.usernameRule).toBe('Your email does not contain {at}evocon, use another format');
    });

    it('does not have error if username and email both include evocon', () => {
      wrapper.setData({ formData: { username: 'test@evocon', email: 'test@evocon.com' } });
      expect(wrapper.vm.usernameRule).toBe(true);
    });

    it('has error if username is not in email format', () => {
      wrapper.setData({ formData: { username: 'test' } });
      expect(wrapper.vm.usernameRule).toBe('Username should be in name{at}company format');
    });

    it('does not have error if username is in email format', () => {
      wrapper.setData({ formData: { username: 'test@test' } });
      expect(wrapper.vm.usernameRule).toBe(true);
    });
  });

  describe('usernameRule, current user has other company email', () => {
    let wrapper;
    beforeEach(() => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          profile: {
            currentUser: { roles: { 0: 'COMPANY_ADMIN' }, email: 'user@other.com' },
            highestUserRole: 'COMPANY_ADMIN',
          },
        },
      });
      wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $route: { params: {} }, $router },
        },
      });
    });

    it('has error if username is empty', () => {
      wrapper.setData({ formData: { username: '' } });
      expect(wrapper.vm.usernameRule).toBe('Please enter {fieldName}');
    });

    it('has error if username includes evocon, but email doesnt', () => {
      wrapper.setData({ formData: { username: 'test@evocon.com', email: 'test@smthelse.com' } });
      expect(wrapper.vm.usernameRule).toBe('Your email does not contain {at}evocon, use another format');
    });

    it('has error if username and email both include evocon', () => {
      wrapper.setData({ formData: { username: 'test@evocon', email: 'test@evocon.com' } });
      expect(wrapper.vm.usernameRule).toBe('Your email does not contain {at}evocon, use another format');
    });

    it('has error if username is not in email format', () => {
      wrapper.setData({ formData: { username: 'test' } });
      expect(wrapper.vm.usernameRule).toBe('Username should be in name{at}company format');
    });

    it('does not have error if username is in email format', () => {
      wrapper.setData({ formData: { username: 'test@test' } });
      expect(wrapper.vm.usernameRule).toBe(true);
    });
  });

  describe('isRemovedUser', () => {
    it('returns false if isLoading is true', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          user: {
            ...defaultPiniaInitialState.user,
            loading: ['loading'],
          },
        },
      });
      const wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $router, $route: { params: { id: 'test@user' } } },
        },
      });

      expect(wrapper.vm.isRemovedUser).toBe(false);
    });

    it('returns false if user id is missing from params', () => {
      const wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [pinia],
          mocks: { $router, $route: { params: {} } },
        },
      });

      expect(wrapper.vm.isRemovedUser).toBe(false);
    });

    it('returns false if selected user is in usersMap and not marked as deleted', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          user: {
            users: [
              {
                fullName: 'Full Name',
                roles: { 1: 'FACTORY_ADMIN' },
                username: 'test@user',
                deleted: false,
              },
            ],
            loading: [],
          },
        },
      });
      const wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $router, $route: { params: { id: 'test@user' } } },
        },
      });

      expect(wrapper.vm.isRemovedUser).toBe(false);
    });

    it('returns true if selected user is in usersMap and marked as deleted', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          user: {
            users: [
              {
                fullName: 'Full Name',
                roles: { 1: 'FACTORY_ADMIN' },
                username: 'test@user',
                deleted: true,
              },
            ],
            loading: [],
          },
        },
      });
      const wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $router, $route: { params: { id: 'test@user' } } },
        },
      });

      expect(wrapper.vm.isRemovedUser).toBe(true);
    });

    it('returns true if selected user is not in usersMap', () => {
      const localPinia = createTestingPinia({
        initialState: {
          ...defaultPiniaInitialState,
          user: {
            users: [
              {
                fullName: 'Full Name',
                roles: { 1: 'FACTORY_ADMIN' },
                username: 'test@user',
              },
            ],
            loading: [],
          },
        },
      });
      const wrapper = shallowMount(SettingsUserEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $router, $route: { params: { id: 'test2@user' } } },
        },
      });

      expect(wrapper.vm.isRemovedUser).toBe(true);
    });
  });

  test('that goToSecurityProfiles opens security profiles overview in new tab', () => {
    const $route = { params: {} };
    const mockResolve = vi.fn().mockReturnValue({ href: '/settings/security/securityprofiles' });
    const mockRouter = { ...$router, resolve: mockResolve };
    const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => {});

    const wrapper = shallowMount(SettingsUserEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route, $router: mockRouter },
      },
    });

    wrapper.vm.goToSecurityProfiles();

    expect(mockResolve).toHaveBeenCalledWith({ name: 'securityProfilesOverview' });
    expect(mockWindowOpen).toHaveBeenCalledWith('/settings/security/securityprofiles', '_blank');

    mockWindowOpen.mockRestore();
  });
});
