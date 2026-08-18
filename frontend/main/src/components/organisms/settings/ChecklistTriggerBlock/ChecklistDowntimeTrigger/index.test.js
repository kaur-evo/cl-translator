import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ChecklistDowntimeTrigger from './index.vue';

import { alertSubtypes } from '@/constants/alerts';

const defaultPiniaInitialState = {
  feature: { checklists: true },
  station: {
    stations: [{ id: 1, name: 'Station 1' }, { id: 2, name: 'Station 2' }],
    loading: [],
  },
  configuration: { configuration: {} },
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } } },
  comment: {
    commentsList: [
      { id: 1, name: 'comment 1', stationIds: [1], groupId: 1 },
      { id: 2, name: 'comment 2', stationIds: [2], groupId: 2 },
      { id: 3, name: 'comment 3', stationIds: [1, 2], groupId: 1 },
    ],
    commentGroupsList: [
      { id: -1, name: 'uncommented' },
      { id: 1, name: 'comment group 1' },
      { id: 2, name: 'comment group 2' },
    ],
    loading: [],
  },
};

const defaultProps = {
  requirements: {
    commentIds: [],
    stationIds: [],
    setpoint: 30 * 60, // 30 min
  },
};

describe('ChecklistDowntimeTrigger', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if subType is EXCEEDS', () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps, subType: alertSubtypes.EXCEEDS },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if subType is EXCEEDS and setpoint is less than 5 minutes', () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 4 * 60 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('availableStationIds', () => {
    it('returns stations from requirements prop if stationIds array has values', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, requirements: { stationIds: [2, 3] } },
      });

      expect(wrapper.vm.availableStationIds).toEqual([2, 3]);
    });

    it('returns adminChecklistStations if stationIds array is empty', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, requirements: { stationIds: [] } },
      });

      expect(wrapper.vm.availableStationIds).toEqual([1, 2]);
    });
  });

  describe('hasStopReasonDurationError', () => {
    it('returns false if subType is ADDED', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.ADDED },
      });

      expect(wrapper.vm.hasStopReasonDurationError).toBe(false);
    });

    it('returns false if subType is EXCEEDS and setpoint is null', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: null } },
      });

      expect(wrapper.vm.hasStopReasonDurationError).toBe(false);
    });

    it('returns false if subType is EXCEEDS and setpoint is more than 5 minutes', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 10 * 60 } },
      });

      expect(wrapper.vm.hasStopReasonDurationError).toBe(false);
    });

    it('returns true if subType is EXCEEDS and setpoint is less than 5 minutes', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 4 * 60 } },
      });

      expect(wrapper.vm.hasStopReasonDurationError).toBe(true);
    });
  });

  test('that subTypesArray returns correct array', () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps },
    });

    expect(wrapper.vm.subTypesArray).toEqual([
      { id: alertSubtypes.EXCEEDS, name: 'Lasts longer than', durationDefault: null, countDefault: 1 },
      { id: alertSubtypes.ADDED, name: 'Is added', durationDefault: 0, countDefault: 1 },
    ]);
  });

  test('that filteredComments returns comments from global commentGroups and from local commentGroups that are filtered by requirements.stationIds', () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        comment: {
          commentsList: [
            { id: 1, name: 'comment 1', stationIds: [1], groupId: 1 },
            { id: 2, name: 'comment 2', stationIds: [2], groupId: 2 },
            { id: 3, name: 'comment 3', stationIds: [1, 2], groupId: 1 },
            { id: 4, name: 'comment 4', stationIds: [3], groupId: 3 },
          ],
          commentGroupsList: [
            { id: 1, name: 'comment group 1', local: true },
            { id: 2, name: 'comment group 2', local: true },
            { id: 3, name: 'comment group 3', local: false },
          ],
          loading: [],
        },
      },
    });
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [localPinia] },
      props: { ...defaultProps, requirements: { stationIds: [1] } },
    });

    expect(wrapper.vm.filteredComments).toEqual([
      { id: 1, name: 'comment 1', stationIds: [1], groupId: 1 },
      { id: 3, name: 'comment 3', stationIds: [1, 2], groupId: 1 },
      { id: 4, name: 'comment 4', stationIds: [3], groupId: 3 },
    ]);
  });

  describe('isTriggerComplete', () => {
    it('returns true if subType is ADDED', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.ADDED },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if subType is EXCEEDS and setpoint is null', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if subType is EXCEEDS and setpoint has a value', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 6 * 60 } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });
  });

  describe('onCheckSubTypeChange', () => {
    it('emits correct events if new subType is EXCEEDS', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.ADDED },
      });

      wrapper.vm.onCheckSubTypeChange([alertSubtypes.EXCEEDS]);
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ setpoint: null, count: 1 });
    });

    it('emits correct events if new subType is ADDED', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { commentIds: [0, 1, 2, 3] } },
      });

      wrapper.vm.onCheckSubTypeChange([alertSubtypes.ADDED]);
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ setpoint: 0, count: 1 });
      expect(wrapper.emitted('update:requirements')[1][0]).toEqual({ commentIds: [1, 2, 3] });
    });
  });

  describe('validate', () => {
    it('does not emit update:requirements if subType is ADDED', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.ADDED },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')).toBeUndefined();
    });

    it('does not emit update:requirements if subType is EXCEEDS and setpoint has a value', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 10 * 60 } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')).toBeUndefined();
    });

    it('emits update:requirements with setpoint as 0 if subType is EXCEEDS and setpoint is null', () => {
      const wrapper = shallowMount(ChecklistDowntimeTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
        props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: null } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ setpoint: 0 });
    });
  });

  test('isTriggerComplete watcher emitting update:is-trigger-complete', async () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: null } },
    });

    expect(wrapper.emitted('update:is-trigger-complete')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { setpoint: 6 * 60 } });
    expect(wrapper.emitted('update:is-trigger-complete')[1][0]).toBe(true);
  });

  test('hasIntervalError watcher emitting update:has-trigger-error', async () => {
    const wrapper = shallowMount(ChecklistDowntimeTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })] },
      props: { ...defaultProps, subType: alertSubtypes.EXCEEDS, requirements: { setpoint: 6 * 60 } },
    });

    expect(wrapper.emitted('update:has-trigger-error')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { setpoint: 4 * 60 } });
    expect(wrapper.emitted('update:has-trigger-error')[1][0]).toBe(true);
  });
});
