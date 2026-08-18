import { shallowMount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import SettingsUserRightsEditForm from './index.vue';

import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';
import {
  OFFICE_USER, LINEVIEW_USER, FACTORY_ADMIN, COMPANY_ADMIN,
} from '@/constants/userRoles';
import useGenericDialogStore from '@/stores/genericDialog';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';

const dialogDataAction = vi.fn();
const closeDialog = vi.fn();

const defaultDialogData = {
  roles: {},
  allowedStations: {},
  lineviewTimeRestrictionValue: 0,
  lineviewTimeRestrictionType: DAYS,
  selectedRole: null,
  action: dialogDataAction,
};

const defaultVisibleUserRolesMap = {
  [COMPANY_ADMIN]: { id: COMPANY_ADMIN, name: 'Company Admin' },
  [FACTORY_ADMIN]: { id: FACTORY_ADMIN, name: 'Factory Admin' },
  [LINEVIEW_USER]: { id: LINEVIEW_USER, name: 'Lineview User' },
  [OFFICE_USER]: { id: OFFICE_USER, name: 'Office User' },
};

const defaultOrderedWriteAccessFactories = [
  { id: 1, stations: [{ id: 1 }] },
  { id: 2, stations: [{ id: 2 }, { id: 3 }] },
  { id: 3, stations: [{ id: 4 }] },
];

const defaultFactoriesMap = {
  1: { id: 1, stations: [{ id: 1 }] },
  2: { id: 2, stations: [{ id: 2 }, { id: 3 }] },
  3: { id: 3, stations: [{ id: 4 }] },
};

const defaultStationsWithAdminPermissions = [
  { name: 'teststation 1', factoryId: 1, id: 1 },
  { name: 'teststation 2', factoryId: 2, id: 2 },
  { name: 'teststation 3', factoryId: 2, id: 3 },
  { name: 'teststation 4', factoryId: 3, id: 4 },
];

const defaultDeviceGetters = {
  screenWidth: 1920,
  showFullscreenDialogs: false,
  isMobileView: false,
  isMobilePortrait: false,
};

const createGlobal = ({
  dialogData = defaultDialogData,
  visibleUserRolesMap = defaultVisibleUserRolesMap,
  orderedWriteAccessFactories = defaultOrderedWriteAccessFactories,
  factoriesMap = defaultFactoriesMap,
  hasMultipleAdminFactories = true,
  stationsWithAdminPermissions = defaultStationsWithAdminPermissions,
  device = defaultDeviceGetters,
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      genericDialog: { dialogData: cloneDeep(dialogData), allowFullscreen: true },
    },
  });
  const gdStore = useGenericDialogStore(pinia);
  gdStore.closeDialog = closeDialog;
  const profileStore = useProfileStore(pinia);
  profileStore.visibleUserRoles = [COMPANY_ADMIN, FACTORY_ADMIN, LINEVIEW_USER, OFFICE_USER];
  profileStore.visibleUserRolesMap = visibleUserRolesMap;
  const factoryStore = useFactoryStore(pinia);
  factoryStore.orderedWriteAccessFactories = orderedWriteAccessFactories;
  factoryStore.factoriesMap = factoriesMap;
  factoryStore.hasMultipleAdminFactories = hasMultipleAdminFactories;
  const stationStore = useStationStore(pinia);
  stationStore.stationsWithAdminPermissions = stationsWithAdminPermissions;
  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = device.screenWidth;
  deviceStore.showFullscreenDialogs = device.showFullscreenDialogs;
  deviceStore.isMobileView = device.isMobileView;
  deviceStore.isMobilePortrait = device.isMobilePortrait;

  return {
    plugins: [pinia],
    stubs: { 'form-dialog-template': false },
  };
};

describe('SettingsUserRightsEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when creating office user in mobile portrait', async () => {
    const wrapper = shallowMount(SettingsUserRightsEditForm, {
      global: createGlobal({
        device: {
          screenWidth: 1920, showFullscreenDialogs: false, isMobileView: true, isMobilePortrait: true,
        },
      }),
    });

    await wrapper.vm.setRole(OFFICE_USER);
    await wrapper.vm.setFactoryRoles([1]);
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('when user is COMPANY_ADMIN in multi-factory tenant', () => {
    test('creating company admin', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select company admin role
      wrapper.vm.setRole(COMPANY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 0: COMPANY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: COMPANY_ADMIN, factoryIds: [0] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // saving company admin
      wrapper.vm.validate = () => {
        wrapper.vm.valid = true;
      };
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 0: COMPANY_ADMIN },
        allowedStations: { 0: true },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });

    test('creating factory admin', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select factory admin role
      wrapper.vm.setRole(FACTORY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factories
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      wrapper.vm.setFactoryRoles([1, 2]);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN, 2: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1, 2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // saving factory admin
      wrapper.vm.validate = () => {
        wrapper.vm.valid = true;
      };
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 1: FACTORY_ADMIN, 2: FACTORY_ADMIN },
        allowedStations: { 0: true },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });

    test('creating office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(),
      });
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office user and check if it renders correctly
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factories
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      wrapper.vm.setFactoryRoles([1, 2]);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: false, 3: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // set write access
      wrapper.vm.onStationRightsChange(1, true);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: false, 3: false });
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      // saving office user
      wrapper.vm.validate = () => {
        wrapper.vm.valid = true;
      };
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 1: OFFICE_USER, 2: OFFICE_USER },
        allowedStations: { 1: true, 2: false, 3: false },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });

    test('creating shiftview user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(),
      });
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office and check if it renders correctly
      wrapper.vm.setRole(LINEVIEW_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select factory
      wrapper.vm.setFactoryRoles([3]);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // select station
      wrapper.vm.onStationSelect(4);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({ 4: true });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      // change station rights
      wrapper.vm.onStationRightsChange(4, false);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({ 4: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // saving shiftview user
      wrapper.vm.validate = () => {
        wrapper.vm.valid = true;
      };
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 3: LINEVIEW_USER },
        allowedStations: { 4: false },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });

    test('removing factory from office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER, 2: OFFICE_USER, 3: OFFICE_USER },
            allowedStations: {
              1: true, 2: true, 3: true, 4: false,
            },
            lineviewTimeRestrictionValue: 5,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: OFFICE_USER, factoryIds: [1, 2, 3] },
            action: dialogDataAction,
          },
        }),
      });

      await flushPromises();

      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({
        1: true, 2: true, 3: true, 4: false,
      });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER, 3: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2, 3] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // remove factory
      wrapper.vm.setFactoryRoles([1, 2]);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: true, 3: true });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('adding factory to office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 2: OFFICE_USER, 3: OFFICE_USER },
            allowedStations: { 2: true, 3: true, 4: false },
            lineviewTimeRestrictionValue: 5,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: OFFICE_USER, factoryIds: [2, 3] },
            action: dialogDataAction,
          },
        }),
      });

      await flushPromises();

      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 2: true, 3: true, 4: false });
      expect(wrapper.vm.roles).toEqual({ 2: OFFICE_USER, 3: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [2, 3] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // remove factory
      wrapper.vm.setFactoryRoles([1, 2, 3]);
      expect(wrapper.vm.allowedStations).toEqual({
        1: false, 2: true, 3: true, 4: false,
      });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER, 3: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2, 3] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('adding office user role to factory admin', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: FACTORY_ADMIN },
            allowedStations: { 0: true },
            lineviewTimeRestrictionValue: 0,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: null,
            action: dialogDataAction,
          },
        }),
      });

      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select office user role
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory for office user
      wrapper.vm.setFactoryRoles([2]);
      expect(wrapper.vm.allowedStations).toEqual({ 2: false, 3: false });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('adding factory admin role to office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER },
            allowedStations: { 1: false },
            lineviewTimeRestrictionValue: 5,
            lineviewTimeRestrictionType: SHIFTS,
            selectedRole: null,
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory admin role
      wrapper.vm.setRole(FACTORY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory for factory admin
      wrapper.vm.setFactoryRoles([2]);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('changing company admin to office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 0: COMPANY_ADMIN },
            allowedStations: { 0: true },
            lineviewTimeRestrictionValue: 5,
            lineviewTimeRestrictionType: SHIFTS,
            selectedRole: { role: COMPANY_ADMIN, factoryIds: [0] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 0: COMPANY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: COMPANY_ADMIN, factoryIds: [0] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      wrapper.vm.setRole(OFFICE_USER); // select role
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      wrapper.vm.setFactoryRoles([2]); // set factories
      expect(wrapper.vm.allowedStations).toEqual({ 2: false, 3: false });
      expect(wrapper.vm.roles).toEqual({ 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(5);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('changing office user to factory admin', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER },
            allowedStations: { 1: false },
            lineviewTimeRestrictionValue: 0,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: OFFICE_USER, factoryIds: [1] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory admin role
      wrapper.vm.setRole(FACTORY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory for factory admin
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });
    test('changing factory admin to office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: FACTORY_ADMIN },
            allowedStations: { 0: true },
            lineviewTimeRestrictionValue: 0,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: FACTORY_ADMIN, factoryIds: [1] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select office user role
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factory for office user
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('changing factory of shiftview user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 2: LINEVIEW_USER },
            allowedStations: { 2: true },
            lineviewTimeRestrictionValue: 2,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: LINEVIEW_USER, factoryIds: [2] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 2: true });
      expect(wrapper.vm.roles).toEqual({ 2: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // change factory
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('changing office role factories of factory admin + office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER, 2: FACTORY_ADMIN },
            allowedStations: { 1: true },
            lineviewTimeRestrictionValue: 2,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: OFFICE_USER, factoryIds: [1] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // change factory
      wrapper.vm.setFactoryRoles([1, 3]);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 4: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: FACTORY_ADMIN, 3: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 3] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });

    test('changing FA role factories of factory admin + office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER, 2: FACTORY_ADMIN },
            allowedStations: { 1: true },
            lineviewTimeRestrictionValue: 2,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: FACTORY_ADMIN, factoryIds: [2] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // change factory
      wrapper.vm.setFactoryRoles([2, 3]);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: FACTORY_ADMIN, 3: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [2, 3] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
    });
  });

  describe('when user is COMPANY_ADMIN in single-factory tenant', () => {
    const singleFactoryStations = [{ id: 1, name: 'station1', factoryId: 1 }, { id: 2, name: 'station2', factoryId: 1 }];
    const singleFactoryConfig = {
      visibleUserRoles: [
        { id: COMPANY_ADMIN, name: 'Company Admin' },
        { id: LINEVIEW_USER, name: 'Lineview User' },
        { id: OFFICE_USER, name: 'Office User' },
      ],
      hasMultipleAdminFactories: false,
      orderedWriteAccessFactories: [{ id: 1, name: 'factory', stations: singleFactoryStations }],
      factoriesMap: { 1: { id: 1, name: 'factory', stations: singleFactoryStations } },
      stationsWithAdminPermissions: singleFactoryStations,
    };

    test('creating COMPANY_ADMIN', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(singleFactoryConfig),
      });
      await flushPromises();
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select company admin role
      wrapper.vm.setRole(COMPANY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 0: COMPANY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: COMPANY_ADMIN, factoryIds: [0] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('creating OFFICE_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(singleFactoryConfig),
      });
      await flushPromises();
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office user role
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // set allowed stations
      wrapper.vm.onStationRightsChange(1, true);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('creating LINEVEIW_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(singleFactoryConfig),
      });
      await flushPromises();
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select lineview user role
      wrapper.vm.setRole(LINEVIEW_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select station
      wrapper.vm.onStationSelect(1);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // change station permission
      wrapper.vm.onStationRightsChange(1, false);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select another station
      wrapper.vm.onStationSelect(2);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: true });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('changing COMPANY_ADMIN to OFFICE_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          ...singleFactoryConfig,
          dialogData: {
            roles: { 0: COMPANY_ADMIN },
            allowedStations: { 0: true },
            lineviewTimeRestrictionValue: 0,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: COMPANY_ADMIN, factoryIds: [0] },
            action: dialogDataAction,
          },
        }),
      });
      await flushPromises();
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 0: COMPANY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: COMPANY_ADMIN, factoryIds: [0] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select office user role
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });
  });

  describe('when user is FACTORY_ADMIN and has multiple factories', () => {
    const faMultiConfig = {
      visibleUserRoles: [
        { id: FACTORY_ADMIN, name: 'Factory Admin' },
        { id: LINEVIEW_USER, name: 'Lineview User' },
        { id: OFFICE_USER, name: 'Office User' },
      ],
    };

    test('creating FACTORY_ADMIN', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faMultiConfig),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select factory admin role
      wrapper.vm.setRole(FACTORY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factories
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      wrapper.vm.setFactoryRoles([1, 2]);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN, 2: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1, 2] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
    });

    test('creating OFFICE_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faMultiConfig),
      });
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office user and check if it renders correctly
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(true);
      // select factories
      wrapper.vm.setFactoryRoles([1]);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      wrapper.vm.setFactoryRoles([1, 2]);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: false, 3: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // set write access
      wrapper.vm.onStationRightsChange(1, true);
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER, 2: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1, 2] });
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: false, 3: false });
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
    });

    test('creating LINEVEIW_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faMultiConfig),
      });
      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office and check if it renders correctly
      wrapper.vm.setRole(LINEVIEW_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select factory
      wrapper.vm.setFactoryRoles([3]);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      // select station
      wrapper.vm.onStationSelect(4);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({ 4: true });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      // change station rights
      wrapper.vm.onStationRightsChange(4, false);
      expect(wrapper.vm.roles).toEqual({ 3: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [3] });
      expect(wrapper.vm.allowedStations).toEqual({ 4: false });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
    });
  });

  describe('when user is FACTORY_ADMIN and has single factory', () => {
    const faSingleStations = [{ id: 1, name: 'station1', factoryId: 1 }, { id: 2, name: 'station2', factoryId: 1 }];
    const faSingleConfig = {
      visibleUserRoles: [
        { id: FACTORY_ADMIN, name: 'Factory Admin' },
        { id: LINEVIEW_USER, name: 'Lineview User' },
        { id: OFFICE_USER, name: 'Office User' },
      ],
      hasMultipleAdminFactories: false,
      orderedWriteAccessFactories: [{ id: 1, name: 'factory', stations: faSingleStations }],
      factoriesMap: { 1: { id: 1, name: 'factory', stations: faSingleStations } },
      stationsWithAdminPermissions: faSingleStations,
    };

    test('creating FACTORY_ADMIN', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faSingleConfig),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select factory admin role
      wrapper.vm.setRole(FACTORY_ADMIN);
      expect(wrapper.vm.allowedStations).toEqual({ 0: true });
      expect(wrapper.vm.roles).toEqual({ 1: FACTORY_ADMIN });
      expect(wrapper.vm.formData).toEqual({ role: FACTORY_ADMIN, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('creating OFFICE_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faSingleConfig),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select office user role
      wrapper.vm.setRole(OFFICE_USER);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // set station rights
      wrapper.vm.onStationRightsChange(1, true);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: false });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });

    test('creating LINEVEIW_USER', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(faSingleConfig),
      });
      // mount component
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({});
      expect(wrapper.vm.formData).toEqual({ role: null, factoryIds: [] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(null);
      // select lineview user role
      wrapper.vm.setRole(LINEVIEW_USER);
      expect(wrapper.vm.allowedStations).toEqual({});
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(false);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // select two stations
      wrapper.vm.onStationSelect(1);
      wrapper.vm.onStationSelect(2);
      expect(wrapper.vm.allowedStations).toEqual({ 1: true, 2: true });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
      // change station rights
      wrapper.vm.onStationRightsChange(1, false);
      expect(wrapper.vm.allowedStations).toEqual({ 1: false, 2: true });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(false);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(0);
      expect(wrapper.vm.timeRestictionToggleVisible).toBe(true);
      expect(wrapper.vm.multiSelectFactoryEnabled).toBe(false);
    });
  });

  describe('removing time restriction', () => {
    test('removing from office user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: OFFICE_USER },
            allowedStations: { 1: true },
            lineviewTimeRestrictionValue: 2,
            lineviewTimeRestrictionType: DAYS,
            selectedRole: { role: OFFICE_USER, factoryIds: [1] },
            action: dialogDataAction,
          },
        }),
      });

      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: OFFICE_USER });
      expect(wrapper.vm.formData).toEqual({ role: OFFICE_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(2);
      expect(wrapper.vm.lineviewTimeRestrictionType).toBe(DAYS);
      // remove time restriction
      wrapper.vm.lineviewTimeRestrictionEnabled = false;
      // saving office user
      wrapper.vm.validate = vi.fn().mockReturnValue(true);
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 1: OFFICE_USER },
        allowedStations: { 1: true },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });

    test('removing from shift view user', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          dialogData: {
            roles: { 1: LINEVIEW_USER },
            allowedStations: { 1: true },
            lineviewTimeRestrictionValue: 4,
            lineviewTimeRestrictionType: SHIFTS,
            selectedRole: { role: LINEVIEW_USER, factoryIds: [1] },
            action: dialogDataAction,
          },
        }),
      });

      // mount component and check if it renders correctly
      expect(wrapper.vm.allowedStations).toEqual({ 1: true });
      expect(wrapper.vm.roles).toEqual({ 1: LINEVIEW_USER });
      expect(wrapper.vm.formData).toEqual({ role: LINEVIEW_USER, factoryIds: [1] });
      expect(wrapper.vm.lineviewTimeRestrictionEnabled).toBe(true);
      expect(wrapper.vm.lineviewTimeRestrictionValue).toBe(4);
      expect(wrapper.vm.lineviewTimeRestrictionType).toBe(SHIFTS);
      // remove time restriction
      wrapper.vm.lineviewTimeRestrictionEnabled = false;
      // saving shift view user
      wrapper.vm.validate = vi.fn().mockReturnValue(true);
      await wrapper.vm.onSaveClick();
      expect(dialogDataAction).toHaveBeenCalledTimes(1);
      expect(dialogDataAction).toHaveBeenCalledWith({
        roles: { 1: LINEVIEW_USER },
        allowedStations: { 1: true },
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: SHIFTS,
      });
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });
  });

  test('that if screenWidth is changed, then getPermissionsMaxHeight is called', () => {
    const wrapper = shallowMount(SettingsUserRightsEditForm, {
      global: createGlobal(),
    });

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn) => fn());
    const getPermissionsMaxHeightSpy = vi.spyOn(wrapper.vm, 'getPermissionsMaxHeight');

    wrapper.vm.$options.watch.screenWidth.call(wrapper.vm, 1500);
    expect(getPermissionsMaxHeightSpy).toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
  });

  describe('getPermissionsMaxHeight', () => {
    it('sets permissionsMaxHeight to 400px if showFullscreenDialogs is false', () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal(),
      });

      wrapper.setData({ permissionsMaxHeight: '250px' });

      expect(wrapper.vm.permissionsMaxHeight).toBe('250px');
      wrapper.vm.getPermissionsMaxHeight();
      expect(wrapper.vm.permissionsMaxHeight).toBe('400px');
    });

    it('sets permissionsMaxHeight to calculated height if showFullscreenDialogs is true and isMobileView is false', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          device: {
            screenWidth: 1920, showFullscreenDialogs: true, isMobileView: false, isMobilePortrait: false,
          },
        }),
      });

      wrapper.vm.$vuetify.display.height = 1000;

      await nextTick();

      wrapper.vm.getPermissionsMaxHeight();
      // header height - 64px; selections height - 164px; actions height - 60px; paddings: 4px;
      expect(wrapper.vm.permissionsMaxHeight).toBe('708px');
    });

    it('sets permissionsMaxHeight to calculated height if showFullscreenDialogs is true and isMobileView is true', async () => {
      const wrapper = shallowMount(SettingsUserRightsEditForm, {
        global: createGlobal({
          device: {
            screenWidth: 1920, showFullscreenDialogs: true, isMobileView: true, isMobilePortrait: false,
          },
        }),
      });

      wrapper.vm.$vuetify.display.height = 1000;

      await nextTick();

      wrapper.vm.getPermissionsMaxHeight();
      // header height - 64px; selections height - 132px; actions height - 60px; paddings: 4px;
      expect(wrapper.vm.permissionsMaxHeight).toBe('740px');
    });
  });
});
