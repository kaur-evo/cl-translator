import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftManagementDialog from './index.vue';

import {
  useGenericDialogStore, useStationStore, useShiftStore,
} from '@/stores/index';
import shiftApi from '@/api/shiftApi';
import stationApi from '@/api/stationApi';

vi.mock('@/api/stationApi');
stationApi.getLimits.mockResolvedValue({});

vi.mock('@/api/shiftApi');
shiftApi.startShift.mockResolvedValue({});
shiftApi.putShift.mockResolvedValue({});

const createWrapper = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const genericDialogStore = useGenericDialogStore(pinia);
  const stationStore = useStationStore(pinia);
  const shiftStore = useShiftStore(pinia);

  genericDialogStore.dialogData = piniaOverrides.dialogData ?? { isStartShift: false };
  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { zoneId: 'UTC', id: 11 };
  shiftStore.shift = piniaOverrides.shift ?? { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T21:50:00.000Z' };

  return shallowMount(ShiftManagementDialog, {
    global: {
      plugins: [pinia],
    },
  });
};

describe('ShiftManagementDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-12-02T12:14:55.000Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if it is a shift start dialog', async () => {
    stationApi.getLimits.mockResolvedValue({
      minStartTimeISO: '2022-12-02T12:00:00.000Z',
      maxStartTimeISO: '2022-12-02T12:30:00.000Z',
      minEndTimeISO: '2022-12-02T21:25:00.000Z',
      maxEndTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      nextShiftName: 'Shift',
    });

    const wrapper = createWrapper({ dialogData: { isStartShift: true } });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is a planned shift start dialog', async () => {
    stationApi.getLimits.mockResolvedValue({
      minStartTimeISO: '2022-12-02T12:00:00.000Z',
      maxStartTimeISO: '2022-12-02T12:30:00.000Z',
      minEndTimeISO: '2022-12-02T21:25:00.000Z',
      maxEndTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      nextShiftName: 'Shift',
    });

    const wrapper = createWrapper({ dialogData: { isStartShift: true } });

    wrapper.vm.isShiftStartSelectionVisible = false;
    wrapper.vm.isPlannedShiftStartSelected = true;
    wrapper.vm.endTime = '22:00';
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is an extra shift start dialog', async () => {
    stationApi.getLimits.mockResolvedValue({
      minStartTimeISO: '2022-12-02T12:00:00.000Z',
      maxStartTimeISO: '2022-12-02T12:30:00.000Z',
      minEndTimeISO: '2022-12-02T21:25:00.000Z',
      maxEndTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      nextShiftName: 'Shift',
    });

    const wrapper = createWrapper({ dialogData: { isStartShift: true } });

    wrapper.vm.isShiftStartSelectionVisible = false;
    wrapper.vm.endTime = '22:00';
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if its edit shift dialog', async () => {
    stationApi.getLimits.mockResolvedValue({
      minStartTimeISO: '2022-12-02T12:00:00.000Z',
      maxStartTimeISO: '2022-12-02T12:30:00.000Z',
      minEndTimeISO: '2022-12-02T21:25:00.000Z',
      maxEndTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
      nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      nextShiftName: 'Shift',
    });

    const wrapper = createWrapper({ dialogData: { isStartShift: false } });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('endDate', () => {
    it('returns empty string if endTime is not set', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
        nextShiftName: 'Shift',
      });

      const wrapper = createWrapper();

      await flushPromises();
      wrapper.vm.endTime = '';
      expect(wrapper.vm.endDate).toBe('');
    });

    it('returns startDate if endTime is between startTime and 00:00', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
        nextShiftName: 'Shift',
      });

      const wrapper = createWrapper();

      await flushPromises();
      expect(wrapper.vm.endDate).toBe('2022-12-02');
    });

    it('returns startDate + 1 day if endTime is 00:00', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T00:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-03T00:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-03T06:00:00.000Z',
        nextShiftName: 'Shift',
      });

      const wrapper = createWrapper({
        shift: { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-03T00:00:00.000Z' },
      });

      await flushPromises();
      expect(wrapper.vm.endDate).toBe('2022-12-03');
    });

    it('returns startDate + 1 day if endTime is between 00:00 and startTime', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T04:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T03:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-03T06:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-03T12:00:00.000Z',
        nextShiftName: 'Shift',
      });

      const wrapper = createWrapper({
        shift: { id: 1, startTimeISO: '2022-12-02T04:00:00.000Z', endTimeISO: '2022-12-03T03:00:00.000Z' },
      });

      await flushPromises();
      expect(wrapper.vm.endDate).toBe('2022-12-03');
    });
  });

  describe('shiftDuration', () => {
    it('returns - if startDateTime and endDateTime are not set', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.shiftDuration).toBe('-');
    });

    it('returns - if startDateTime is set and endDateTime is not set', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T04:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T03:00:00.000Z',
      });

      const wrapper = createWrapper();

      await flushPromises();
      wrapper.vm.endTime = '';
      expect(wrapper.vm.startDateTime).not.toBeNull();
      expect(wrapper.vm.endDateTime).toBeNull();
      expect(wrapper.vm.shiftDuration).toBe('-');
    });

    it('returns - if startDateTime is not set and endDateTime is set', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T04:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T03:00:00.000Z',
      });

      const wrapper = createWrapper();

      await flushPromises();
      wrapper.vm.startTime = '';
      expect(wrapper.vm.startDateTime).toBeNull();
      expect(wrapper.vm.endDateTime).not.toBeNull();
      expect(wrapper.vm.shiftDuration).toBe('-');
    });

    it('returns 11h 15m if startDateTime and endDateTime are both set and their diff is 11h 15m', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T04:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T03:00:00.000Z',
      });

      const wrapper = createWrapper({
        shift: { id: 1, startTimeISO: '2022-12-02T10:00:00.000Z', endTimeISO: '2022-12-03T21:15:00.000Z' },
      });

      await flushPromises();
      expect(wrapper.vm.startDateTime).not.toBeNull();
      expect(wrapper.vm.endDateTime).not.toBeNull();
      expect(wrapper.vm.shiftDuration).toBe('11h 15m');
    });
  });

  test('that onBackButtonClick sets isShiftStartSelectionVisible to true and isPlannedShiftStartSelected to false', () => {
    const wrapper = createWrapper();

    wrapper.vm.isShiftStartSelectionVisible = false;
    wrapper.vm.isPlannedShiftStartSelected = true;

    wrapper.vm.onBackButtonClick();

    expect(wrapper.vm.isShiftStartSelectionVisible).toBe(true);
    expect(wrapper.vm.isPlannedShiftStartSelected).toBe(false);
  });

  test('that onShiftStartSelectionClick sets isShiftStartSelectionVisible to false and isPlannedShiftStartSelected equal to method input', () => {
    const wrapper = createWrapper({ dialogData: { isStartShift: true } });

    expect(wrapper.vm.isShiftStartSelectionVisible).toBe(true);
    expect(wrapper.vm.isPlannedShiftStartSelected).toBe(false);

    wrapper.vm.onShiftStartSelectionClick(true);

    expect(wrapper.vm.isShiftStartSelectionVisible).toBe(false);
    expect(wrapper.vm.isPlannedShiftStartSelected).toBe(true);

    wrapper.vm.onShiftStartSelectionClick(false);

    expect(wrapper.vm.isShiftStartSelectionVisible).toBe(false);
    expect(wrapper.vm.isPlannedShiftStartSelected).toBe(false);
  });

  describe('openHelp', () => {
    it('calls window.open with the correct url, if it is start planned shift dialog', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

      const wrapper = createWrapper({ dialogData: { isStartShift: true } });

      wrapper.vm.onShiftStartSelectionClick(true);
      wrapper.vm.openHelp();

      expect(windowOpenSpy).toHaveBeenCalledWith('https://support.evocon.com/Start-a-planned-shift-early-11fdae0ba80280edbb6fea03667c3054', '_blank');

      windowOpenSpy.mockRestore();
    });

    it('calls window.open with the correct url, if it is start extra shift dialog', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

      const wrapper = createWrapper({ dialogData: { isStartShift: true } });

      wrapper.vm.onShiftStartSelectionClick(false);
      wrapper.vm.openHelp();

      expect(windowOpenSpy).toHaveBeenCalledWith('https://support.evocon.com/Starting-and-closing-extra-shifts-e9ab5d9e0a4b4c8ca45537e3c3c64a79', '_blank');

      windowOpenSpy.mockRestore();
    });

    it('calls window.open with the correct url, if it is edit shift dialog', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

      const wrapper = createWrapper();

      wrapper.vm.openHelp();

      expect(windowOpenSpy).toHaveBeenCalledWith('https://support.evocon.com/Editing-shift-time-343e33c0d53e46e0bf50b1dd77869158', '_blank');

      windowOpenSpy.mockRestore();
    });
  });

  describe('onSave', () => {
    test('that startShift is called with stationId, startTimeISO, endTimeISO and shiftTemplateId, if its planned shift start dialog', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
        nextShiftTemplateId: 123,
      });

      shiftApi.startShift.mockResolvedValue({ id: 123 });

      const wrapper = createWrapper({ dialogData: { isStartShift: true } });

      await flushPromises();
      wrapper.vm.onShiftStartSelectionClick(true);
      wrapper.vm.endTime = '23:30';

      await wrapper.vm.onSave();

      expect(shiftApi.startShift).toHaveBeenCalled();
      expect(shiftApi.startShift).toHaveBeenCalledWith({
        stationId: 11,
        startTimeISO: '2022-12-02T12:14:00.000Z',
        endTimeISO: '2022-12-02T23:30:00.000Z',
        shiftTemplateId: 123,
      });
      expect(wrapper.vm.saveLoading).toBe(false);
    });

    test('that startShift is called with stationId, startTimeISO and endTimeISO, if its extra shift start dialog', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      shiftApi.startShift.mockResolvedValue({ id: 123 });

      const wrapper = createWrapper({ dialogData: { isStartShift: true } });

      await flushPromises();
      wrapper.vm.onShiftStartSelectionClick(false);
      wrapper.vm.endTime = '22:00';

      await wrapper.vm.onSave();

      expect(shiftApi.startShift).toHaveBeenCalled();
      expect(shiftApi.startShift).toHaveBeenCalledWith({
        stationId: 11,
        startTimeISO: '2022-12-02T12:14:00.000Z',
        endTimeISO: '2022-12-02T22:00:00.000Z',
      });
      expect(wrapper.vm.saveLoading).toBe(false);
    });

    test('that putShift is called with shiftId, eventTimeISO, stationId, startTimeISO and endTimeISO, if its edit shift dialog', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      shiftApi.putShift.mockResolvedValue({ id: 1 });

      const wrapper = createWrapper();

      await flushPromises();

      await wrapper.vm.onSave();
      expect(shiftApi.putShift).toHaveBeenCalled();
      expect(shiftApi.putShift).toHaveBeenCalledWith({
        shiftId: 1,
        eventTimeISO: '2022-12-02T12:00:00.000Z',
        stationId: 11,
        startTimeISO: '2022-12-02T12:00:00.000Z',
        endTimeISO: '2022-12-02T21:50:00.000Z',
      });
      expect(wrapper.vm.saveLoading).toBe(false);
    });
  });

  describe('isSavingDisabled', () => {
    it('returns true if isSaveBtnDisabled is true', () => {
      const wrapper = createWrapper();

      wrapper.vm.isSaveBtnDisabled = true;
      expect(wrapper.vm.isSavingDisabled).toBe(true);
    });

    it('returns true if saveLoading is true', () => {
      const wrapper = createWrapper();

      wrapper.vm.saveLoading = true;
      expect(wrapper.vm.isSavingDisabled).toBe(true);
    });

    it('returns true if it is shift edit dialog, startDate and startTime are equal to formatted shift start time and endTime is equal to formatted shift end time', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      const wrapper = createWrapper({
        dialogData: { isStartShift: false },
        shift: { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T21:50:00.000Z' },
      });

      await flushPromises();

      expect(wrapper.vm.startDate).toBe('2022-12-02');
      expect(wrapper.vm.startTime).toBe('12:00');
      expect(wrapper.vm.endTime).toBe('21:50');
      expect(wrapper.vm.isSavingDisabled).toBe(true);
    });

    it('returns false if it is shift edit dialog and startDate is not equal to formatted shift start time', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-03T02:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      const wrapper = createWrapper({
        dialogData: { isStartShift: false },
        shift: { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T21:50:00.000Z' },
      });

      await flushPromises();

      wrapper.vm.startDate = '2022-12-03';
      expect(wrapper.vm.isSavingDisabled).toBe(false);
    });

    it('returns false if it is shift edit dialog and startTime is not equal to formatted shift start time', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T13:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:25:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      const wrapper = createWrapper({
        dialogData: { isStartShift: false },
        shift: { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T21:50:00.000Z' },
      });

      await flushPromises();
      wrapper.vm.startTime = '13:00';
      expect(wrapper.vm.isSavingDisabled).toBe(false);
    });

    it('returns false if it is shift edit dialog and endTime is not equal to formatted shift end time', async () => {
      stationApi.getLimits.mockResolvedValue({
        minStartTimeISO: '2022-12-02T12:00:00.000Z',
        maxStartTimeISO: '2022-12-02T12:30:00.000Z',
        minEndTimeISO: '2022-12-02T21:00:00.000Z',
        maxEndTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftStartTimeISO: '2022-12-02T22:00:00.000Z',
        nextShiftEndTimeISO: '2022-12-02T23:30:00.000Z',
      });

      const wrapper = createWrapper({
        dialogData: { isStartShift: false },
        shift: { id: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T21:50:00.000Z' },
      });

      await flushPromises();
      wrapper.vm.endTime = '21:00';
      expect(wrapper.vm.isSavingDisabled).toBe(false);
    });

    it('returns false if isStartShiftDialog is true', () => {
      const wrapper = createWrapper({ dialogData: { isStartShift: true } });

      expect(wrapper.vm.isSavingDisabled).toBe(false);
    });
  });
});
