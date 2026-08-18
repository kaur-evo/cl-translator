import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewFooterMenu from './index.vue';

import { DAYS } from '@/constants/shiftViewTimeRestrictionTypes';
import CentrifugeService from '@/services/CentrifugeService';
import {
  useConfigurationStore, useProfileStore, useOperatorStore,
  useShiftviewTimelineStore, useShiftStore, useShiftviewSelectionStore,
  useDeviceStore,
} from '@/stores/index';

const centrifugeServiceMock = new CentrifugeService();
centrifugeServiceMock.subscribe = vi.fn();
centrifugeServiceMock.unsubscribe = vi.fn();

window.centrifugeService = centrifugeServiceMock;

vi.mock('@/api/statisticsApi');

const defaultPiniaState = {
  checklistTask: { checklistTasks: [] },
  profile: {
    currentUser: {
      lineviewLanguages: [], allowedStations: { 1: true }, lineviewTimeRestrictionValue: 0, lineviewTimeRestrictionType: DAYS,
    },
    language: 'en',
  },
  station: { lineviewStation: { id: 1, showManualShift: true, zoneId: 'UTC' } },
  shiftviewTimeline: { teamTimeline: [] },
  shift: {
    statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} },
    shift: { endTime: '2020-02-02T06:00:00' },
    shifts: [{ endTime: '2020-02-02T06:00:00' }],
    isShiftRunning: false,
  },
  userPreferences: { viewSettings: { hideChangeover: false } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.checklistStations = overrides.configuration?.checklistStations ?? [1];

  const profileStore = useProfileStore(pinia);
  profileStore.shiftviewStationUserRole = overrides.profile?.shiftviewStationUserRole ?? 'LINEVIEW_USER';
  profileStore.numberFormattingOptions = overrides.profile?.numberFormattingOptions ?? { decimalPlaces: 4 };
  profileStore.shiftviewStationRoleAllows = overrides.profile?.shiftviewStationRoleAllows ?? (() => true);

  const operatorStore = useOperatorStore(pinia);
  operatorStore.operatorsRealMap = overrides.operator?.operatorsRealMap ?? new Map();

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.yellowRanges = overrides.shiftviewTimeline?.yellowRanges ?? [];
  shiftviewTimelineStore.slicesByType = overrides.shiftviewTimeline?.slicesByType ?? { uncommented: 0, commented: 0, planned: 0 };
  shiftviewTimelineStore.shiftScrapDisplayValue = overrides.shiftviewTimeline?.shiftScrapDisplayValue ?? 4.3245;

  const shiftStore = useShiftStore(pinia);
  shiftStore.isLastShiftSelected = overrides.shift?.isLastShiftSelected ?? true;

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.isSelectionActive = overrides.shiftviewSelection?.isSelectionActive ?? false;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => shallowMount(ShiftViewFooterMenu, {
  props: { requireOperator: false, ...options.props },
  global: { plugins: [createPinia(overrides)] },
});

describe('ShiftViewFooterMenu', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if user has multiple lineview languages', () => {
    const wrapper = createWrapper({
      profile: {
        currentUser: {
          lineviewLanguages: ['en', 'et'], allowedStations: { 1: true }, lineviewTimeRestrictionValue: 0, lineviewTimeRestrictionType: DAYS,
        },
        language: 'en',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if user has multiple lineview languages and screen size is less than 600px', async () => {
    const wrapper = createWrapper({
      profile: {
        currentUser: {
          lineviewLanguages: ['en', 'et'], allowedStations: { 1: true }, lineviewTimeRestrictionValue: 0, lineviewTimeRestrictionType: DAYS,
        },
        language: 'en',
      },
    });

    wrapper.vm.$vuetify.display.smAndUp = false;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if isSelectionActive is true', () => {
    const wrapper = createWrapper({ shiftviewSelection: { isSelectionActive: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that messages counter in shift view footer menu is equal to unreadMessagesCount prop value', async () => {
    const wrapper = createWrapper({}, { props: { unreadMessagesCount: 0 } });

    expect(wrapper.vm.menu.find((item) => item.id === 'messages').counter).toBe(0);

    await wrapper.setProps({ unreadMessagesCount: 5 });

    expect(wrapper.vm.menu.find((item) => item.id === 'messages').counter).toBe(5);
  });

  describe('getLastActiveTeam', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2022-01-01T12:34:33.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns Operators if there is not an active team', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: { teamTimeline: [{ startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T09:00:00.000Z', operatorIds: [11] }] },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operators');
    });

    it('returns Operators in ended shift if last active team end time is before shift end time', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: { teamTimeline: [{ startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T17:00:00.000Z', operatorIds: [11] }] },
        operator: { operatorsRealMap: new Map([[11, { id: 11, name: 'Operator11' }]]) },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operators');
    });

    it('returns operator name in ended shift if last active team has one operator and team end time is equal to shift end time', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: { teamTimeline: [{ startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T18:00:00.000Z', operatorIds: [11] }] },
        operator: { operatorsRealMap: new Map([[11, { id: 11, name: 'Operator11' }]]) },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operator11');
    });

    it('returns operator name + team size - 1 in ended shift if last active team has multiple operators and team end time is equal to shift end time', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: { teamTimeline: [{ startTimeISO: '2021-12-31T08:00:00.000Z', endTimeISO: '2021-12-31T18:00:00.000Z', operatorIds: [11, 12, 13] }] },
        operator: { operatorsRealMap: new Map([[11, { id: 11, name: 'Operator11' }], [12, { id: 12, name: 'Operator12' }], [13, { id: 13, name: 'Operator13' }]]) },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operator11 +2');
    });

    it('returns operator name if last active team has one operator', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: {
          teamTimeline: [
            { startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T14:00:00.000Z', operatorIds: [11] },
            { startTimeISO: '2022-01-01T14:00:00.000Z', endTimeISO: '2022-01-01T18:00:00.000Z', operatorIds: [12, 13] },
          ],
        },
        operator: { operatorsRealMap: new Map([[11, { id: 11, name: 'Operator11' }], [12, { id: 12, name: 'Operator12' }], [13, { id: 13, name: 'Operator13' }]]) },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operator11');
    });

    it('returns operator name + team size - 1 if last active team has multiple operators', () => {
      const wrapper = createWrapper({
        shift: { shift: { startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T18:00:00.000Z' }, statisticsRaw: { shiftTotal: { scrapQty: 0 }, hourStatistics: {} }, shifts: [{ endTime: '2020-02-02T06:00:00' }], isShiftRunning: false },
        shiftviewTimeline: {
          teamTimeline: [
            { startTimeISO: '2022-01-01T08:00:00.000Z', endTimeISO: '2022-01-01T14:00:00.000Z', operatorIds: [11, 12] },
            { startTimeISO: '2022-01-01T14:00:00.000Z', endTimeISO: '2022-01-01T18:00:00.000Z', operatorIds: [13] },
          ],
        },
        operator: { operatorsRealMap: new Map([[11, { id: 11, name: 'Operator11' }], [12, { id: 12, name: 'Operator12' }], [13, { id: 13, name: 'Operator13' }]]) },
      });

      const lastActiveTeam = wrapper.vm.getLastActiveTeam();
      expect(lastActiveTeam).toBe('Operator11 +1');
    });
  });

  describe('menu', () => {
    it('has checklist menu item when station is in checklist stations', () => {
      const wrapper = createWrapper();

      const checklistMenuItem = wrapper.vm.menu.find((item) => item.id === 'checklists');
      expect(checklistMenuItem).toBeDefined();
    });

    it('does not have checklist menu item when station is not in checklist stations', () => {
      const wrapper = createWrapper({
        configuration: { checklistStations: [2, 3] },
        station: { lineviewStation: { id: 1, showManualShift: true, zoneId: 'UTC' } },
      });

      const checklistMenuItem = wrapper.vm.menu.find((item) => item.id === 'checklists');
      expect(checklistMenuItem).not.toBeDefined();
    });
  });
});
