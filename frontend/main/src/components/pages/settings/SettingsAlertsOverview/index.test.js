import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsAlertsOverview from './index.vue';

import productApi from '@/api/productApi';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/productApi');

productApi.getFilteredProducts = vi.fn().mockResolvedValue([]);

const defaultAlerts = [{
  id: 1,
  name: 'test alert name',
  requirements: {
    stationIds: [], productIds: [], operatorIds: [], shiftTemplateIds: [], positionIds: [], type: 'STOPREASON',
  },
  output: {
    channels: [{ type: 'EMAIL', targets: ['test1@example.com'] }],
  },
}];

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      station: {
        stations: [{ id: 1, name: 'test station name', factoryId: 1 }],
      },
      factory: {
        factories: [{ id: 1, name: 'test factory name', stations: [{ id: 1, name: 'test station name' }] }],
      },
      operator: {
        operatorsList: [{ id: 1, name: 'test operator name', stationIds: [], factoryIds: [] }],
      },
      alert: {
        alerts: overrides.alerts || defaultAlerts,
        loading: [],
      },
      shiftTemplate: {
        shiftTemplates: [{ id: 1, name: 'test shift template' }],
      },
      position: {
        positions: [{ id: 1, primaryName: 'test position' }],
      },
      profile: {
        currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
      },
    },
  });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

describe('SettingsAlertsOverview', () => {
  test('it mounts correctly', async () => {
    const wrapper = shallowMount(SettingsAlertsOverview, {
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getEmailOutputString', () => {
    it('returns "-" for empty channels array', () => {
      const alerts = [{
        id: 1,
        name: 'test alert name',
        requirements: { stationIds: [], productIds: [], operatorIds: [], shiftTemplateIds: [], positionIds: [], type: 'STOPREASON' },
        output: { channels: [] },
      }];
      const wrapper = shallowMount(SettingsAlertsOverview, {
        global: { plugins: [createPinia({ alerts })] },
      });

      expect(wrapper.vm.getEmailOutputString(alerts[0].output)).toBe('-');
    });

    it('returns "-" if only webhook exists in channels', () => {
      const alerts = [{
        id: 1,
        name: 'test alert name',
        requirements: { stationIds: [], productIds: [], operatorIds: [], shiftTemplateIds: [], positionIds: [], type: 'STOPREASON' },
        output: { channels: [{ type: 'WEBHOOK', url: 'testurl' }] },
      }];
      const wrapper = shallowMount(SettingsAlertsOverview, {
        global: { plugins: [createPinia({ alerts })] },
      });

      expect(wrapper.vm.getEmailOutputString(alerts[0].output)).toBe('-');
    });

    it('returns emails if only email exists in channels', () => {
      const alerts = [{
        id: 1,
        name: 'test alert name',
        requirements: { stationIds: [], productIds: [], operatorIds: [], shiftTemplateIds: [], positionIds: [], type: 'STOPREASON' },
        output: { channels: [{ type: 'EMAIL', targets: ['test1@example.com'] }] },
      }];
      const wrapper = shallowMount(SettingsAlertsOverview, {
        global: { plugins: [createPinia({ alerts })] },
      });

      expect(wrapper.vm.getEmailOutputString(alerts[0].output)).toBe('test1@example.com');
    });

    it('returns emails if both email and webhook exist in channels', () => {
      const alerts = [{
        id: 1,
        name: 'test alert name',
        requirements: { stationIds: [], productIds: [], operatorIds: [], shiftTemplateIds: [], positionIds: [], type: 'STOPREASON' },
        output: {
          channels: [
            { type: 'EMAIL', targets: ['test1@example.com', 'test2@example.com'] },
            { type: 'WEBHOOK', url: 'testurl' },
          ],
        },
      }];
      const wrapper = shallowMount(SettingsAlertsOverview, {
        global: { plugins: [createPinia({ alerts })] },
      });

      expect(wrapper.vm.getEmailOutputString(alerts[0].output)).toBe('test1@example.com, test2@example.com');
    });
  });
});
