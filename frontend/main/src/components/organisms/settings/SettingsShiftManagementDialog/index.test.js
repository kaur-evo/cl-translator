import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';
import { nextTick } from 'vue';

import useDeviceStore from '@/stores/device';
import useGenericDialogStore from '@/stores/genericDialog';
import useShiftTemplateStore from '@/stores/shiftTemplate';
import SettingsShiftManagementDialog from '@/components/organisms/settings/SettingsShiftManagementDialog/index.vue';
import stationApi from '@/api/stationApi';
vi.mock('@/api/stationApi');

describe('SettingsShiftManagementDialog', () => {
  let wrapper;

  const station = { id: 1, zoneId: 'Europe/Tallinn' };
  const shift = {
    id: 101,
    startTimeISO: '2023-10-26T08:00:00.000Z',
    endTimeISO: '2023-10-26T16:00:00.000Z',
    shiftTemplateId: 201,
  };

  const dialogData = {
    isStartShift: false,
    station,
    shift,
    xScale: {
      domain: () => ['2023-10-26T00:00:00.000Z', '2023-10-27T00:00:00.000Z'],
    },
  };

  const mountComponent = () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = false;
    deviceStore.showFullscreenDialogs = false;
    deviceStore.screen = {};
    const gdStore = useGenericDialogStore(pinia);
    Object.assign(gdStore, { dialogData });

    wrapper = shallowMount(SettingsShiftManagementDialog, {
      global: {
        plugins: [pinia],
        mocks: {
          $t: (key) => key,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    stationApi.getLimits.mockResolvedValue({
      minStartTimeISO: '2023-10-26T00:00:00.000Z',
      maxStartTimeISO: '2023-10-26T23:59:00.000Z',
      minEndTimeISO: '2023-10-26T00:01:00.000Z',
      maxEndTimeISO: '2023-10-27T00:00:00.000Z',
    });

    // eslint-disable-next-line no-undef
    global.window.open = vi.fn();
  });

  it('should call stationApi.getLimits on mount with correct parameters', async () => {
    mountComponent();
    await nextTick();


    const shiftStartTime = DateTime.fromISO(shift.startTimeISO, { zone: station.zoneId });
    expect(stationApi.getLimits).toHaveBeenCalledWith(station.id, {
      shiftId: shift.id,
      baseDate: shiftStartTime.toISO(),
    });
  });

  it('should initialize start and end times based on shift data from store', async () => {
    mountComponent();
    await nextTick();

    const shiftStartTime = DateTime.fromISO(shift.startTimeISO, { zone: station.zoneId });
    const shiftEndTime = DateTime.fromISO(shift.endTimeISO, { zone: station.zoneId });

    expect(wrapper.vm.startDate).toBe(shiftStartTime.toFormat('yyyy-MM-dd'));
    expect(wrapper.vm.startTime).toBe(shiftStartTime.toFormat('HH:mm'));
    expect(wrapper.vm.endTime).toBe(shiftEndTime.toFormat('HH:mm'));
  });

  it('should call closeDialog action when cancel button is clicked', async () => {
    mountComponent();
    const gdStore = useGenericDialogStore();
    const closeDialogSpy = vi.spyOn(gdStore, 'closeDialog');
    await wrapper.vm.closeDialog();
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  it('should open help link in a new tab when help is clicked', async () => {
    mountComponent();
    const toolbar = wrapper.findComponent({ name: 'ShiftManagementDialogToolbar' });
    toolbar.vm.$emit('on-help-click');
    expect(window.open).toHaveBeenCalledWith('https://support.evocon.com/Editing-shift-time-343e33c0d53e46e0bf50b1dd77869158', '_blank');
  });

  it('should call onSave and dispatch actions when save button is clicked', async () => {
    mountComponent();
    await nextTick();

    const gdStore = useGenericDialogStore();
    const closeDialogSpy = vi.spyOn(gdStore, 'closeDialog');
    const stStore = useShiftTemplateStore();
    const saveTimeDeviationSpy = vi.spyOn(stStore, 'saveShiftTemplateTimeDeviation').mockResolvedValue();
    const fetchTimelineSpy = vi.spyOn(stStore, 'fetchShiftTemplateTimeline').mockResolvedValue();

    // Simulate a change to enable the save button
    wrapper.vm.startTime = '11:30';
    await nextTick();

    await wrapper.vm.onSave();

    const expectedStartDateTime = DateTime.fromObject({ year: 2023, month: 10, day: 26, hour: 11, minute: 30 }, { zone: station.zoneId });
    const expectedEndDateTime = DateTime.fromObject({ year: 2023, month: 10, day: 26, hour: 19, minute: 0 }, { zone: station.zoneId });

    expect(saveTimeDeviationSpy).toHaveBeenCalledWith({
      stationIds: [station.id],
      startTime: expectedStartDateTime.toISO(),
      endTime: expectedEndDateTime.toISO(),
      shiftTemplateId: shift.shiftTemplateId,
    });

    expect(fetchTimelineSpy).toHaveBeenCalledWith({
      dateRange: dialogData.xScale.domain(),
      stationId: station.id,
    });

    expect(closeDialogSpy).toHaveBeenCalled();
  });

  it('should correctly calculate endDate when shift crosses midnight', async () => {
    mountComponent();
    await nextTick();

    wrapper.vm.startDate = '2023-10-26';
    wrapper.vm.startTime = '22:00';
    wrapper.vm.endTime = '06:00';
    await nextTick();

    expect(wrapper.vm.endDate).toBe('2023-10-27');
  });

  it('should correctly calculate shiftDuration', async () => {
    mountComponent();
    await nextTick();

    wrapper.vm.startDate = '2023-10-26';
    wrapper.vm.startTime = '08:00';
    wrapper.vm.endTime = '16:30';
    await nextTick();

    expect(wrapper.vm.shiftDuration).toBe('8h 30m');
  });

  it('should disable save button initially if no changes are made', async () => {
    mountComponent();
    await nextTick();

    expect(wrapper.vm.isSavingDisabled).toBe(true);
  });

  it('should enable save button when time is changed', async () => {
    mountComponent();
    await nextTick();

    wrapper.vm.startTime = '11:01';
    await nextTick();

    expect(wrapper.vm.isSavingDisabled).toBe(false);
  });

  it('should compute correct shiftDuration for overnight shifts', async () => {
    mountComponent();
    await nextTick();

    wrapper.vm.startDate = '2023-10-26';
    wrapper.vm.startTime = '22:00';
    wrapper.vm.endTime = '06:00';
    await nextTick();

    expect(wrapper.vm.shiftDuration).toBe('8h 0m');
  });

  it('should update startDate when startTime is changed to a time after endTime on the same day', async () => {
    mountComponent();
    await nextTick();

    wrapper.vm.startDate = '2023-10-26';
    wrapper.vm.startTime = '23:00';
    wrapper.vm.endTime = '06:00';
    await nextTick();

    expect(wrapper.vm.endDate).toBe('2023-10-27');
    expect(wrapper.vm.shiftDuration).toBe('7h 0m');
  });
});
