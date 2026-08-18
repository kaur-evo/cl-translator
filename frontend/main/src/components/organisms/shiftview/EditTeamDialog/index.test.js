import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useOperatorStore, useDeviceStore, useProfileStore } from '@/stores/index';

const defaultDialogData = {
  operatorIds: [],
  startTimeISO: '2022-01-01T00:00:00.000Z',
  endTimeISO: '2022-01-01T01:30:00.000Z',
};

const defaultPiniaState = {
  shift: { shift: { startTimeISO: '2022-01-01T00:00:00.000Z', endTimeISO: '2022-01-01T01:30:00.000Z' } },
  station: { lineviewStation: { zoneId: 'America/Los_Angeles', id: 1 } },
  shiftviewTimeline: { teamTimeline: [] },
  genericDialog: { dialogData: { ...defaultDialogData }, previousState: {}, allowFullscreen: true },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const operatorStore = useOperatorStore(pinia);
  operatorStore.shiftviewStationOperators = overrides.operator?.shiftviewStationOperators ?? [
    { id: 1, name: 'Operator 1', stationIds: [1] },
    { id: 2, name: 'Operator 2', stationIds: [1] },
    { id: 3, name: 'Operator 3', stationIds: [1] },
  ];

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = overrides.profile?.highestRoleAllows ?? (() => true);

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(index, {
  global: { plugins: [createPinia(overrides)] },
});

describe('EditTeamDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if station has no operators', () => {
    const wrapper = createWrapper({ operator: { shiftviewStationOperators: [] } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if station has no operators and user is not admin', () => {
    const wrapper = createWrapper({
      operator: { shiftviewStationOperators: [] },
      profile: { highestRoleAllows: () => false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if no operators are selected', () => {
      const wrapper = createWrapper({
        genericDialog: { dialogData: { ...defaultDialogData, operatorIds: [] }, previousState: {}, allowFullscreen: true },
      });

      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if saveLoading is true', () => {
      const wrapper = createWrapper({
        genericDialog: { dialogData: { ...defaultDialogData, operatorIds: [1] }, previousState: {}, allowFullscreen: true },
      });
      wrapper.vm.saveLoading = true;

      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if start time is not valid', () => {
      const wrapper = createWrapper({
        genericDialog: { dialogData: { ...defaultDialogData, operatorIds: [1], startTimeISO: 'invalid-time' }, previousState: {}, allowFullscreen: true },
      });

      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if end time is not valid', () => {
      const wrapper = createWrapper({
        genericDialog: { dialogData: { ...defaultDialogData, operatorIds: [1], endTimeISO: 'invalid-time' }, previousState: {}, allowFullscreen: true },
      });

      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if formData start time is not equal to dialogData start time', () => {
      const wrapper = createWrapper({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            operatorIds: [1],
            startTimeISO: '2022-01-01T00:00:00.000Z',
            endTimeISO: '2022-01-01T01:30:00.000Z',
          },
          previousState: {},
          allowFullscreen: true,
        },
      });

      wrapper.vm.formData.startTimeISO = '2022-01-01T00:30:00.000Z';

      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData end time is not equal to dialogData end time', () => {
      const wrapper = createWrapper({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            operatorIds: [1],
            startTimeISO: '2022-01-01T00:00:00.000Z',
            endTimeISO: '2022-01-01T01:25:00.000Z',
          },
          previousState: {},
          allowFullscreen: true,
        },
      });

      wrapper.vm.formData.endTimeISO = '2022-01-01T01:30:00.000Z';

      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData operator ids are not equal to dialogData operator ids', () => {
      const wrapper = createWrapper({
        genericDialog: { dialogData: { ...defaultDialogData, operatorIds: [1, 3] }, previousState: {}, allowFullscreen: true },
      });

      wrapper.vm.formData.operatorIds = [2, 4];

      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if start time, end time and operator ids are equal to initial values', () => {
      const wrapper = createWrapper({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            operatorIds: [1, 2],
            startTimeISO: '2022-01-01T00:00:00.000Z',
            endTimeISO: '2022-01-01T01:30:00.000Z',
          },
          previousState: {},
          allowFullscreen: true,
        },
      });

      expect(wrapper.vm.formData.startTimeISO).toBe('2022-01-01T00:00:00.000Z');
      expect(wrapper.vm.formData.endTimeISO).toBe('2022-01-01T01:30:00.000Z');
      expect(wrapper.vm.formData.operatorIds).toEqual([1, 2]);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });
  });
});
