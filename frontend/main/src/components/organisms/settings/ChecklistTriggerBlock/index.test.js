import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import ChecklistTriggerBlock from './index.vue';

import { alertSubtypes } from '@/constants/alerts';
import { checklistTypes, getPeriodicFrequenciesList } from '@/constants/checklistsConstants';
import useDeviceStore from '@/stores/device';


const defaultPiniaState = {
  position: {
    positions: [
      {
        id: 1, name: 'position 1', stationIds: [1], commentIds: [1, 2],
      },
      {
        id: 2, name: 'position 2', stationIds: [2], commentIds: [2, 3],
      },
    ],
  },
  configuration: {
    configuration: { checklistStations: [1, 2] },
  },
  station: {
    stations: [
      { id: 1, name: 'station 1', factoryId: 1 },
      { id: 2, name: 'station 2', factoryId: 2 },
    ],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
  feature: {
    checklists: true,
  },
};

const createGlobal = (piniaState = defaultPiniaState, { isMobile = false } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: cloneDeep(piniaState),
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobile;
  return { plugins: [pinia] };
};

describe('ChecklistTriggerBlock', () => {
  it('renders correctly without any type selected', () => {
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: { requirements: { type: null } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('PERIODIC type', () => {
    const defaultProps = { requirements: { type: checklistTypes.PERIODIC, manualAllowed: true } };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: defaultProps,
    });

    it('renders correctly', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistPeriodicTrigger');
    });

    test('that additionalMenuItems returns correct array', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });
  });

  describe('INTERVAL type', () => {
    const defaultProps = {
      requirements: {
        type: checklistTypes.INTERVAL,
        resetOnShiftStart: true,
        resetOnChangeover: true,
        pauseDuringDowntime: true,
        manualAllowed: true,
      },
    };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: defaultProps,
    });

    it('renders correctly', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistIntervalTrigger');
    });

    test('additionalMenuItems', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          id: 'resetOnShiftStart',
          text: 'Reset at shift start',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
          isNew: false,
        },
        {
          text: 'Reset at product changeover',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
          isNew: true,
        },
        {
          text: 'Pause timer during downtime',
          isVisible: true,
          isSelected: true,
          iconTooltip: 'This option excludes machine downtime. E.g. if 10 minutes of downtime occur, the checklist will be displayed 10 minutes later',
          action: expect.any(Function),
        },
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });
  });

  describe('SHIFT type', () => {
    const defaultProps = { requirements: { type: checklistTypes.SHIFT, manualAllowed: true } };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: defaultProps,
    });

    it('renders correctly', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistShiftTrigger');
    });

    test('that additionalMenuItems returns correct array', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });
  });

  describe('CHANGEOVER type', () => {
    let wrapper;
    const changeoverDefaultRequirements = {
      type: checklistTypes.CHANGEOVER,
      intervalTime: 3600,
      leadTime: 0,
      resetOnShiftStart: true,
      pauseDuringDowntime: true,
      manualAllowed: true,
    };

    beforeEach(() => {
      wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: changeoverDefaultRequirements },
      });
    });

    it('renders correctly if type is CHANGEOVER and intervalTime is more than a minute', async () => {
      await flushPromises();
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly if type is CHANGEOVER and intervalTime is less than a minute', async () => {
      await wrapper.setProps({ requirements: { ...changeoverDefaultRequirements, intervalTime: 30 } });
      await flushPromises();
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistChangeoverTrigger');
    });

    describe('isChangeoverAfterMode', () => {
      it('returns true when type is CHANGEOVER and leadTime is 0', () => {
        expect(wrapper.vm.isChangeoverAfterMode).toBe(true);
      });

      it('returns false when type is CHANGEOVER and leadTime is greater than 0', async () => {
        await wrapper.setProps({ requirements: { ...changeoverDefaultRequirements, leadTime: 60 } });
        expect(wrapper.vm.isChangeoverAfterMode).toBe(false);
      });
    });

    test('additionalMenuItems in after mode', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          id: 'interval',
          text: 'Add interval',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
        {
          id: 'resetOnShiftStart',
          text: 'Reset at shift start',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
          isNew: true,
        },
        {
          text: 'Pause timer during downtime',
          isVisible: true,
          isSelected: true,
          iconTooltip: 'This option excludes machine downtime. E.g. if 10 minutes of downtime occur, the checklist will be displayed 10 minutes later',
          action: expect.any(Function),
        },
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });

    test('additionalMenuItems in before mode only shows Allow manual activation', async () => {
      await wrapper.setProps({ requirements: { ...changeoverDefaultRequirements, leadTime: 60 } });
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });

    describe('requirements.leadTime watcher', () => {
      it('resets interval block and emits when leadTime changes to greater than 0 and interval block is visible', async () => {
        wrapper.vm.isIntervalBlockVisible = true;
        await wrapper.setProps({ requirements: { ...changeoverDefaultRequirements, leadTime: 60 } });
        expect(wrapper.vm.isIntervalBlockVisible).toBe(false);
        expect(wrapper.emitted()['update:requirements'].at(-1)[0]).toEqual({
          intervalTime: null,
          resetOnShiftStart: false,
          pauseDuringDowntime: false,
        });
      });

      it('does not emit when leadTime changes to greater than 0 and interval block is not visible', async () => {
        wrapper.vm.isIntervalBlockVisible = false;
        const emittedBefore = wrapper.emitted()['update:requirements']?.length ?? 0;
        await wrapper.setProps({ requirements: { ...changeoverDefaultRequirements, leadTime: 60 } });
        expect(wrapper.emitted()['update:requirements']?.length ?? 0).toBe(emittedBefore);
      });
    });

    describe('hasChangeoverIntervalError', () => {
      it('returns false if isIntervalBlockVisible is false', () => {
        wrapper.vm.isIntervalBlockVisible = false;
        expect(wrapper.vm.hasChangeoverIntervalError).toBe(false);
      });

      it('returns false if isIntervalBlockVisible is true and intervalTime is null', () => {
        wrapper.vm.isIntervalBlockVisible = true;
        wrapper.vm.$props.requirements.intervalTime = null;
        expect(wrapper.vm.hasChangeoverIntervalError).toBe(false);
      });

      it('returns false if isIntervalBlockVisible is true and intervalTime is more than a minute', () => {
        wrapper.vm.isIntervalBlockVisible = true;
        wrapper.vm.$props.requirements.intervalTime = 120;
        expect(wrapper.vm.hasChangeoverIntervalError).toBe(false);
      });

      it('returns true if isIntervalBlockVisible is true and intervalTime is less than a minute', () => {
        wrapper.vm.isIntervalBlockVisible = true;
        wrapper.vm.$props.requirements.intervalTime = 30;
        expect(wrapper.vm.hasChangeoverIntervalError).toBe(true);
      });
    });
  });

  describe('QUANTITY type', () => {
    const defaultProps = {
      requirements: {
        type: checklistTypes.QUANTITY,
        resetOnShiftStart: true,
        resetOnChangeover: true,
        manualAllowed: true,
      },
    };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: defaultProps,
    });

    it('renders correctly', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistQuantityTrigger');
    });

    test('additionalMenuItems', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          id: 'resetOnShiftStart',
          text: 'Reset at shift start',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
          isNew: true,
        },
        {
          text: 'Reset at product changeover',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
          isNew: true,
        },
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });
  });

  describe('STOPREASON type', () => {
    const defaultProps = {
      requirements: {
        type: checklistTypes.STOPREASON,
        stationIds: [1],
        positionIds: [1],
        manualAllowed: true,
      },
    };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: defaultProps,
    });

    it('renders correctly', async () => {
      await flushPromises();
      expect(wrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistDowntimeTrigger');
    });

    test('additionalMenuItems', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([
        {
          id: 'location',
          text: 'Machine location',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
        {
          text: 'Allow manual activation',
          isVisible: true,
          isSelected: true,
          action: expect.any(Function),
        },
      ]);
    });

    describe('setAdditionalBlocksVisibility', () => {
      it('calls updateSubType with ADDED if setpoint is 0', async () => {
        const subWrapper = shallowMount(ChecklistTriggerBlock, {
          global: createGlobal(),
          props: { requirements: { ...defaultProps.requirements, setpoint: 0 } },
        });

        await flushPromises();

        const spy = vi.fn();
        const mockRef = { updateSubType: spy };
        Object.defineProperty(subWrapper.vm.$refs, 'triggerRef', {
          get: () => mockRef,
          configurable: true,
        });

        await subWrapper.vm.setAdditionalBlocksVisibility();

        expect(spy).toHaveBeenCalledWith(alertSubtypes.ADDED);
      });

      it('calls updateSubType with EXCEEDS if setpoint is more than 0', async () => {
        const subWrapper = shallowMount(ChecklistTriggerBlock, {
          global: createGlobal(),
          props: { requirements: { ...defaultProps.requirements, setpoint: 300 } },
        });

        await flushPromises();

        const spy = vi.fn();
        const mockRef = { updateSubType: spy };
        Object.defineProperty(subWrapper.vm.$refs, 'triggerRef', {
          get: () => mockRef,
          configurable: true,
        });

        await subWrapper.vm.setAdditionalBlocksVisibility();

        expect(spy).toHaveBeenCalledWith(alertSubtypes.EXCEEDS);
      });
    });
  });

  describe('MANUAL type', () => {
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: { requirements: { type: checklistTypes.MANUAL } },
    });

    it('renders correctly', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly in mobile view if type is MANUAL', () => {
      const mobileWrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(defaultPiniaState, { isMobile: true }),
        props: {
          requirements: { type: checklistTypes.MANUAL },
          savedRequirements: { type: checklistTypes.MANUAL },
        },
      });

      expect(mobileWrapper.element).toMatchSnapshot();
    });

    test('that currentTriggerComponent returns correct component name', () => {
      expect(wrapper.vm.currentTriggerComponent).toBe('ChecklistManualTrigger');
    });

    test('additionalMenuItems', () => {
      expect(wrapper.vm.additionalMenuItems).toEqual([]);
    });
  });

  describe('availableStationIds', () => {
    it('returns stationIds from requirements if they are defined', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC, stationIds: [2] } },
      });

      expect(wrapper.vm.availableStationIds).toEqual([2]);
    });

    it('returns adminChecklistStations from store if stationIds in requirements are not defined', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC, stationIds: [] } },
      });

      expect(wrapper.vm.availableStationIds).toEqual([1, 2]);
    });
  });

  describe('isTriggerComplete', () => {
    it('returns false if type is null', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns false if trigger has an error', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      wrapper.vm.hasCurrentTriggerError = true;
      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if type is MANUAL', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.MANUAL } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if type is CHANGEOVER, isIntervalBlockVisible is true and intervalTime is null', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.CHANGEOVER, intervalTime: null } },
      });

      wrapper.vm.isIntervalBlockVisible = true;
      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if type is CHANGEOVER, isIntervalBlockVisible is true and intervalTime is more than a minute', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.CHANGEOVER, intervalTime: 120 } },
      });

      wrapper.vm.isIntervalBlockVisible = true;
      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns true if type is CHANGEOVER and isIntervalBlockVisible is false', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.CHANGEOVER, intervalTime: null } },
      });

      wrapper.vm.isIntervalBlockVisible = false;
      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if isCurrentTriggerComplete is false', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      wrapper.vm.isCurrentTriggerComplete = false;
      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if isCurrentTriggerComplete is true', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      wrapper.vm.isCurrentTriggerComplete = true;
      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });
  });

  describe('hasTriggerError', () => {
    it('returns true if hasChangeoverIntervalError is true', async () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.CHANGEOVER, intervalTime: 30 } },
      });

      await flushPromises();
      expect(wrapper.vm.hasChangeoverIntervalError).toBe(true);
      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns false if hasCurrentTriggerError is false', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      wrapper.vm.hasCurrentTriggerError = false;
      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if hasCurrentTriggerError is true', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      wrapper.vm.hasCurrentTriggerError = true;
      expect(wrapper.vm.hasTriggerError).toBe(true);
    });
  });

  test('that isTriggerComplete watcher emits update:is-trigger-complete', async () => {
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: { requirements: { type: checklistTypes.MANUAL } },
    });

    expect(wrapper.emitted()['update:is-trigger-complete'][0][0]).toBe(true);
    await wrapper.setProps({ requirements: { type: null } });
    expect(wrapper.emitted()['update:is-trigger-complete'][1][0]).toBe(false);
  });

  test('that setAdditionalBlocksVisibility is called on mounted', async () => {
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: {
        requirements: {
          type: checklistTypes.INTERVAL,
          intervalTime: 3 * 60 * 60, // 3 hours
          pauseDuringDowntime: true,
          resetOnShiftStart: true,
          resetOnChangeover: false,
          manualAllowed: true,
        },
      },
    });

    const setAdditionalBlocksVisibilitySpy = vi.spyOn(wrapper.vm, 'setAdditionalBlocksVisibility');

    await flushPromises();
    expect(setAdditionalBlocksVisibilitySpy).toHaveBeenCalled();
  });

  describe('onSelectType', () => {
    let wrapper;
    let resetTriggerSpy;

    beforeEach(() => {
      wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: {
          requirements: { type: null },
        },
      });
      resetTriggerSpy = vi.spyOn(wrapper.vm, 'resetTrigger');
    });

    it('does not call resetTrigger if reset is false', () => {
      wrapper.vm.onSelectType(checklistTypes.QUANTITY, false);
      expect(resetTriggerSpy).not.toHaveBeenCalled();
    });

    it('calls resetTrigger if reset is true', () => {
      wrapper.vm.onSelectType(checklistTypes.QUANTITY, true);
      expect(resetTriggerSpy).toHaveBeenCalled();
    });

    it('emits update:has-trigger-error with false', () => {
      wrapper.vm.onSelectType(checklistTypes.QUANTITY);
      expect(wrapper.emitted()['update:has-trigger-error'][0][0]).toBe(false);
    });

    it('emits update:requirements with the first subType from periodicFrequenciesList if type is PERIODIC', () => {
      wrapper.vm.onSelectType(checklistTypes.PERIODIC);
      expect(wrapper.emitted()['update:requirements'][0][0]).toEqual({ subType: getPeriodicFrequenciesList()[0].id });
    });

    it('emits update:requirements with the new type', () => {
      wrapper.vm.onSelectType(checklistTypes.QUANTITY);
      expect(wrapper.emitted()['update:requirements'][0][0]).toEqual({ type: checklistTypes.QUANTITY });
    });
  });

  test('resetTrigger', async () => {
    const savedRequirements = {
      type: checklistTypes.CHANGEOVER,
      targetQty: 14,
      delayTime: 40 * 60,
      intervalTime: 2 * 60 * 60,
      times: ['13:13'],
      pauseDuringDowntime: true,
      resetOnShiftStart: true,
      resetOnChangeover: false,
      stationIds: [1, 2],
      factoryIds: [1],
      manualAllowed: true,
      productIds: [1, 2],
      positionIds: [],
    };
    const wrapper = shallowMount(ChecklistTriggerBlock, {
      global: createGlobal(),
      props: {
        requirements: {
          type: checklistTypes.CHANGEOVER,
          targetQty: 12,
          delayTime: 30 * 60,
          intervalTime: 60 * 60,
          times: ['12:12'],
          pauseDuringDowntime: true,
          resetOnShiftStart: true,
          resetOnChangeover: false,
          stationIds: [1, 2],
          factoryIds: [1],
          manualAllowed: true,
          productIds: [1, 2],
          positionIds: [],
        },
        savedRequirements: { ...savedRequirements },
      },
    });

    wrapper.vm.resetTrigger('source', true);
    let emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ ...savedRequirements });

    wrapper.vm.resetTrigger('source', false);
    emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({
      type: '',
      intervalTime: null,
      delayTime: 0,
      leadTime: 0,
      pauseDuringDowntime: false,
      resetOnShiftStart: false,
      resetOnChangeover: false,
      manualAllowed: false,
      offsetFromEndSeconds: null,
      offsetFromStartSeconds: null,
      daysOfWeek: [],
      times: [''],
      targetQty: null,
      commentIds: [],
      positionIds: [],
    });
  });

  describe('validate', () => {
    it('emits update:has-trigger-error with true if type is null', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: null } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted()['update:has-trigger-error'][0][0]).toBe(true);
    });

    it('emits update:requirements with intervalTime as 0 if type is CHANGEOVER, isIntervalBlockVisible is true and intervalTime is null', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.CHANGEOVER, intervalTime: null } },
      });

      wrapper.vm.isIntervalBlockVisible = true;
      wrapper.vm.validate();
      expect(wrapper.emitted()['update:requirements'][0][0]).toEqual({ intervalTime: 0 });
    });

    it('calls validate on triggerRef', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      const spy = vi.fn();
      const mockRef = { validate: spy };
      Object.defineProperty(wrapper.vm.$refs, 'triggerRef', {
        get: () => mockRef,
        configurable: true,
      });

      wrapper.vm.validate();
      expect(spy).toHaveBeenCalled();
    });

    it('does not call validate on triggerRef if triggerRef does not have a validate method', () => {
      const wrapper = shallowMount(ChecklistTriggerBlock, {
        global: createGlobal(),
        props: { requirements: { type: checklistTypes.PERIODIC } },
      });

      const spy = vi.fn();
      const triggerRefMock = {};
      Object.defineProperty(wrapper.vm.$refs, 'triggerRef', {
        get: () => triggerRefMock,
        configurable: true,
      });

      wrapper.vm.validate();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
