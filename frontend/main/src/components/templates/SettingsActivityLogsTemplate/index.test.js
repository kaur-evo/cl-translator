import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import axios from 'axios';

import SettingsActivityLogsTemplate from './index.vue';

import logApi from '@/api/logApi';
import activityLogsApi from '@/api/activityLogsApi';
import { entities } from '@/constants/activityLogsConstants';
import { TODAY, YESTERDAY } from '@/constants/predefinedTimePeriodNames';
import { getRequestParams } from '@/helpers/activityLogs/activityLogsHelpers';
import getObjectDiffKeys from '@/helpers/object/getObjectDiffKeys';
import { COMPANY_ADMIN } from '@/constants/userRoles';
import { useGenericNotificationStore } from '@/stores/index';

vi.mock('@/helpers/object/getObjectDiffKeys');

vi.mock('@/api/logApi', () => ({
  default: {
    logEvent: vi.fn(),
  },
}));

vi.mock('@/api/activityLogsApi', () => ({
  default: {
    getSVActivityLogs: vi.fn(),
    getSettingsActivityLogs: vi.fn(),
  },
}));

vi.mock('@/helpers/activityLogs/activityLogsHelpers', () => ({
  getRequestParams: vi.fn(),
}));

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    filterbar: { requestFilterState: {} },
    ...overrides,
  },
});

const defaultProps = {
  entityName: 'entityName',
  headerSelectionKey: 'headerSelectionKey',
  overviewHeader: 'overviewHeader',
  filterConfiguration: new Map(),
  tableHeaders: [{ id: 1, name: 'Header 1' }, { id: 2, name: 'Header 2' }],
  innerHeader: 'innerHeader',
};

describe('SettingsActivityLogsTemplate', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsActivityLogsTemplate, {
      props: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsActivityLogsTemplate, {
      props: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('requestEntities', () => {
    it('returns correct entities when entityName is svActivityLogs and events are present in filter', () => {
      const filterState = { [entities.STATION]: [1], period: TODAY, events: [entities.DOWNTIME, entities.SCRAP] };
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia({ filterbar: { requestFilterState: filterState } })] },
      });

      expect(wrapper.vm.requestEntities).toEqual({ [entities.STATION]: [1], [entities.DOWNTIME]: [], [entities.SCRAP]: [] });
    });

    it('returns correct entities when entityName is svActivityLogs and no events are present in filter', () => {
      const filterState = { [entities.STATION]: [1], period: TODAY };
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia({ filterbar: { requestFilterState: filterState } })] },
      });

      expect(wrapper.vm.requestEntities).toEqual({ [entities.STATION]: [1] });
    });

    it('returns correct entities when entityName is settingsActivityLogs', () => {
      const filterState = { [entities.USER]: [1], period: TODAY, entity: [entities.USER] };
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia({ filterbar: { requestFilterState: filterState } })] },
      });

      expect(wrapper.vm.requestEntities).toEqual({ [entities.USER]: [1] });
    });
  });

  test('that onOpenHelp calls window.open with correct URL', () => {
    const wrapper = shallowMount(SettingsActivityLogsTemplate, {
      props: { ...defaultProps, helpUrl: 'testurl' },
      global: { plugins: [createPinia()] },
    });

    window.open = vi.fn();
    wrapper.vm.onOpenHelp();
    expect(window.open).toHaveBeenCalledWith('testurl', '_blank');
    window.open.mockRestore();
  });

  test('that onListItemClick calls logApi.logEvent with correct payload', () => {
    const wrapper = shallowMount(SettingsActivityLogsTemplate, {
      props: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });

    const item = { id: 'testItem', name: 'Test Item' };

    wrapper.vm.onListItemClick(item.id);
    expect(logApi.logEvent).toHaveBeenCalledWith([{
      type: 'activity log header selection',
      message: `Selected from header dropdown: ${item.id}`,
    }]);
  });

  describe('processActivityLogs', () => {
    it('returns formatted logs for svActivityLogs', () => {
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const logs = [
        {
          id: 1,
          event: entities.SIGNAL,
          oldValues: [],
          newValues: [{ quantity: 10, unitId: 'kg', extraNote: 'Test Note' }],
          station: { id: 1, name: 'Station 1', zoneId: 'zone1' },
          shift: { id: 2, name: 'Shift 2' },
          operators: ['Operator A'],
          product: { id: 3, name: 'Product 3', sku: 'SKU-123' },
        },
      ];

      expect(wrapper.vm.processActivityLogs(logs)).toEqual([
        {
          id: 1,
          event: entities.SIGNAL,
          oldValues: [],
          newValues: [[
            {
              key: 'quantity', unchanged: false, value: '10 kg', isSubheader: false,
            }, {
              key: 'Extra note', unchanged: false, value: 'Test Note', isSubheader: false,
            },
          ]],
          station: { id: 1, name: 'Station 1', zoneId: 'zone1' },
          shift: { id: 2, name: 'Shift 2' },
          operators: ['Operator A'],
          product: { id: 3, name: 'Product 3', sku: 'SKU-123' },
        },
      ]);
    });

    it('returns formatted logs for settingsActivityLogs', () => {
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const logs = [
        {
          entityId: 1,
          entity: { entityType: entities.USER },
          oldValues: [],
          newValues: [{
            email: 'testuser@evocon.com',
            name: 'Test User',
            username: 'test@user',
            roles: [{
              name: COMPANY_ADMIN, factories: [], factoryCount: 0, stations: [], stationCount: 0,
            }],
          }],
        },
      ];

      expect(wrapper.vm.processActivityLogs(logs)).toEqual([
        {
          entityId: 1,
          entity: { entityType: entities.USER },
          oldValues: [],
          newValues: [[
            {
              key: 'Name', unchanged: false, value: 'Test User', isSubheader: false,
            },
            {
              key: 'Username', unchanged: false, value: 'test@user', isSubheader: false,
            },
            {
              key: 'Email', unchanged: false, value: 'testuser@evocon.com', isSubheader: false,
            },
            {
              key: '',
              isSubheader: false,
              unchanged: false,
              value: [
                {
                  key: 'Role', keyClass: 'font-weight-medium', persistent: false, value: COMPANY_ADMIN,
                },
                {
                  key: 'Factories', keyClass: 'font-weight-medium', persistent: false, value: 'All',
                },
                {
                  key: 'Stations', keyClass: 'font-weight-medium', persistent: false, value: 'All',
                },
              ],
            },
          ]],
        },
      ]);
    });
  });

  describe('fetchActivityLogs', () => {
    it('does not call getSVActivityLogs if entityName is svActivityLogs and required params are missing', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: {}, limit: 10, page: 1 });

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSVActivityLogs).not.toHaveBeenCalled();
    });

    it('does not call getSettingsActivityLogs if entityName is settingsActivityLogs and required params are missing', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: {}, limit: 10, page: 1 });

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSettingsActivityLogs).not.toHaveBeenCalled();
    });

    it('cancels previous request and calls getSVActivityLogs with correct params if entityName is svActivityLogs', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.STATION], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const cancelTokenSourceSpy = vi.fn();
      wrapper.vm.cancelTokenSource = { cancel: cancelTokenSourceSpy };

      await wrapper.vm.fetchActivityLogs();
      expect(cancelTokenSourceSpy).toHaveBeenCalled();
      expect(activityLogsApi.getSVActivityLogs).toHaveBeenCalledWith({
        filter: { entities: [entities.STATION], startDate: '2024-01-01', endDate: '2024-01-02' },
        limit: 10,
        page: 1,
      }, {
        cancelToken: expect.objectContaining({
          promise: expect.any(Promise),
        }),
      });
    });

    it('cancels previous request and calls getSettingsActivityLogs with correct params if entityName is settingsActivityLogs', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.USER], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const cancelTokenSourceSpy = vi.fn();
      wrapper.vm.cancelTokenSource = { cancel: cancelTokenSourceSpy };

      await wrapper.vm.fetchActivityLogs();
      expect(cancelTokenSourceSpy).toHaveBeenCalled();
      expect(activityLogsApi.getSettingsActivityLogs).toHaveBeenCalledWith({
        filter: { entities: [entities.USER], startDate: '2024-01-01', endDate: '2024-01-02' },
        limit: 10,
        page: 1,
      }, {
        cancelToken: expect.objectContaining({
          promise: expect.any(Promise),
        }),
      });
    });

    it('dispatches notifyError and sets loading to false if getSVActivityLogs fails', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.STATION], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });
      activityLogsApi.getSVActivityLogs.mockRejectedValueOnce(new Error('Fail'));

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const notificationStore = useGenericNotificationStore();
      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSVActivityLogs).toHaveBeenCalled();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('dispatches notifyError and sets loading to false if getSettingsActivityLogs fails', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.USER], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });
      activityLogsApi.getSettingsActivityLogs.mockRejectedValueOnce(new Error('Fail'));

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const notificationStore = useGenericNotificationStore();
      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSettingsActivityLogs).toHaveBeenCalled();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('does not dispatch notifyError if entityName is svActivityLogs and axios.isCancel returns true', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.STATION], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });
      activityLogsApi.getSVActivityLogs.mockRejectedValueOnce({ isAxiosError: true });
      axios.isCancel = vi.fn(() => true);

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'svActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const notificationStore = useGenericNotificationStore();
      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSVActivityLogs).toHaveBeenCalled();
      expect(notificationStore.notifyError).not.toHaveBeenCalledWith('We are sorry! There is a problem with your request');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('does not dispatch notifyError if entityName is settingsActivityLogs and axios.isCancel returns true', async () => {
      getRequestParams.mockResolvedValueOnce({ filter: { entities: [entities.USER], startDate: '2024-01-01', endDate: '2024-01-02' }, limit: 10, page: 1 });
      activityLogsApi.getSettingsActivityLogs.mockRejectedValueOnce({ isAxiosError: true });
      axios.isCancel = vi.fn(() => true);

      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const notificationStore = useGenericNotificationStore();
      await wrapper.vm.fetchActivityLogs();
      expect(activityLogsApi.getSettingsActivityLogs).toHaveBeenCalled();
      expect(notificationStore.notifyError).not.toHaveBeenCalledWith('We are sorry! There is a problem with your request');
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('onRequestFilterStateChange', () => {
    it('does not set tableOptions page to 1 if getObjectDiffKeys returns empty array', async () => {
      getObjectDiffKeys.mockReturnValue([]);
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      const newVal = { [entities.USER]: [], entity: [entities.USER] };
      const oldVal = { [entities.USER]: [], entity: [entities.USER] };
      wrapper.vm.tableOptions.page = 2;
      await wrapper.vm.onRequestFilterStateChange(newVal, oldVal);
      expect(wrapper.vm.tableOptions.page).toBe(2);
    });

    it('sets tableOptions page to 1 if getObjectDiffKeys returns non-empty array', async () => {
      getObjectDiffKeys.mockReturnValue(['period']);
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      const newVal = { [entities.USER]: [], entity: [entities.USER], period: YESTERDAY };
      const oldVal = { [entities.USER]: [], entity: [entities.USER], period: TODAY };
      wrapper.vm.tableOptions.page = 2;
      await wrapper.vm.onRequestFilterStateChange(newVal, oldVal);
      expect(wrapper.vm.tableOptions.page).toBe(1);
    });

    it('sets tableOptions page to 1 and emits modify-entity-param with newVal and oldVal, if entityName is settingsActivityLogs and getObjectDiffKeys includes entity', async () => {
      getObjectDiffKeys.mockReturnValue(['entity']);
      const wrapper = shallowMount(SettingsActivityLogsTemplate, {
        props: { ...defaultProps, entityName: 'settingsActivityLogs' },
        global: { plugins: [createPinia()] },
      });

      const newVal = { [entities.USER]: [], entity: [entities.USER] };
      const oldVal = { [entities.STATION]: [], entity: [entities.STATION] };
      wrapper.vm.tableOptions.page = 2;
      await wrapper.vm.onRequestFilterStateChange(newVal, oldVal);
      expect(wrapper.vm.tableOptions.page).toBe(1);
      expect(wrapper.emitted('modify-entity-param')[0][0]).toEqual(entities.STATION, entities.USER);
    });
  });
});
