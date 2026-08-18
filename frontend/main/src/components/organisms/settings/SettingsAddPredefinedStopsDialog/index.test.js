import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import SettingsAddPredefinedStopsDialog from './index.vue';

import useDeviceStore from '@/stores/device';
import { timeFormats } from '@/constants/formattingConstants';


const defaultPiniaState = {
  genericDialog: {
    dialogData: { predefinedStops: [], stationIds: [] },
  },
  position: {
    positions: [
      { id: 1, name: 'position1', stationIds: [1] },
      { id: 2, name: 'position2', stationIds: [1, 2] },
    ],
  },
  comment: {
    commentsList: [
      { id: 1, name: 'comment1', stationIds: [1, 2] },
      { id: 2, name: 'comment2', stationIds: [1] },
      { id: 3, name: 'comment3', stationIds: [3] },
    ],
    commentGroupsList: [
      { id: 1, name: 'group1', factoryIds: [11, 12] },
      { id: 2, name: 'group2', factoryIds: [11, 13] },
    ],
  },
  profile: {
    currentUser: {
      timeFormat: timeFormats['24H'],
    },
  },
};

const createGlobal = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  });
  useDeviceStore(pinia).isMobileView = false;
  return {
    plugins: [pinia],
  };
};

describe('SettingsAddPredefinedStopsDialog', () => {
  vi.useFakeTimers();
  beforeEach(() => {
    vi.setSystemTime = new Date(new Date('2020-01-01T12:34:33'));
  });

  it('renders correctly when adding shiftTemplate', async () => {
    const wrapper = mount(SettingsAddPredefinedStopsDialog, {
      shallow: true,
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              shiftStart: '12:00',
              shiftEnd: '18:00',
              stationIds: [1],
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing shiftTemplate', async () => {
    const wrapper = mount(SettingsAddPredefinedStopsDialog, {
      shallow: true,
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              predefinedStop: {},
              shiftStart: '12:00',
              shiftEnd: '18:00',
              stationIds: [1],
              shiftId: 123,
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('calls cancel method when cancel button is clicked', async () => {
    const wrapper = mount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal(),
    });

    const spy = vi.spyOn(wrapper.vm, 'closeDialog');
    await wrapper.find('#cancel-button').trigger('click', spy);
    expect(wrapper.vm.closeDialog).toHaveBeenCalledTimes(1);
  });

  it('calls save method when apply button is clicked', async () => {
    const wrapper = mount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal(),
    });

    const spy = vi.spyOn(wrapper.vm, 'onSaveClick');
    await wrapper.find('#save-button').trigger('click', spy);
    expect(wrapper.vm.onSaveClick).toHaveBeenCalledTimes(1);
  });

  test('checkOverlapping', async () => {
    const wrapper = shallowMount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            index: 1,
            stationIds: [],
            predefinedStops: [
              { startTime: '12:00', endTime: '14:00' },
              { startTime: '15:00', endTime: '16:00' },
            ],
          },
        },
      }),
    });

    await wrapper.setData({ formData: { startTime: '10:00', endTime: '12:00' } });
    expect(wrapper.vm.checkOverlapping()).toBe(false);

    await wrapper.setData({ formData: { startTime: '14:00', endTime: '16:00' } });
    expect(wrapper.vm.checkOverlapping()).toBe(false);

    await wrapper.setData({ formData: { startTime: '14:25', endTime: '14:50' } });
    expect(wrapper.vm.checkOverlapping()).toBe(false);

    await wrapper.setData({ formData: { startTime: '14:25', endTime: '15:30' } });
    expect(wrapper.vm.checkOverlapping()).toBe(false);

    await wrapper.setData({ formData: { startTime: '13:00', endTime: '15:30' } });
    expect(wrapper.vm.checkOverlapping()).toBe(true);
  });

  test('startTimeRule', async () => {
    const wrapper = shallowMount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            stationIds: [],
            shiftStart: '22:00',
            shiftEnd: '06:00',
          },
        },
      }),
    });

    await flushPromises();

    expect(wrapper.vm.startTimeRule).toBe(true);
    await wrapper.setData({ formData: { startTime: undefined } });
    expect(wrapper.vm.startTimeRule).toBe('Start time needs to be defined');
    await wrapper.setData({ formData: { startTime: '21:00' } });
    expect(wrapper.vm.startTimeRule).toBe('Entered time is outside shift boundaries');
    await wrapper.setData({ formData: { startTime: '04:00', endTime: '03:00' } });
    expect(wrapper.vm.startTimeRule).toBe('Start time');
    await wrapper.setData({ formData: { startTime: '23:00', endTime: '23:00' } });
    expect(wrapper.vm.startTimeRule).toBe('Start time');
    await wrapper.setData({ formData: { startTime: '03:00', endTime: '04:00' } });
    expect(wrapper.vm.startTimeRule).toBe(true);
  });

  test('endTimeRule', async () => {
    const wrapper = shallowMount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            stationIds: [],
            shiftStart: '22:00',
            shiftEnd: '06:00',
          },
        },
      }),
    });

    await flushPromises();

    expect(wrapper.vm.endTimeRule).toBe(true);
    await wrapper.setData({ formData: { endTime: undefined } });
    expect(wrapper.vm.endTimeRule).toBe('End time needs to be defined');
    await wrapper.setData({ formData: { endTime: '07:00' } });
    expect(wrapper.vm.endTimeRule).toBe('Entered time is outside shift boundaries');
    await wrapper.setData({ formData: { startTime: '04:00', endTime: '03:00' } });
    expect(wrapper.vm.endTimeRule).toBe('End time');
    await wrapper.setData({ formData: { startTime: '23:00', endTime: '23:00' } });
    expect(wrapper.vm.endTimeRule).toBe('End time');
    await wrapper.setData({ formData: { startTime: '03:00', endTime: '04:00' } });
    expect(wrapper.vm.endTimeRule).toBe(true);
  });

  test('that filteredComments returns only comments that are assigned to selected stations', async () => {
    const wrapper = shallowMount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            shiftStart: '12:00',
            shiftEnd: '18:00',
            stationIds: [1, 2],
            shiftId: 123,
          },
        },
      }),
    });

    await flushPromises();
    expect(wrapper.vm.filteredComments).toEqual([{ id: 1, name: 'comment1', stationIds: [1, 2] }, { id: 2, name: 'comment2', stationIds: [1] }]);
  });

  test('that onDeleteStop calls secondaryAction and closeDialog', async () => {
    const onSecondaryAction = vi.fn();
    const wrapper = shallowMount(SettingsAddPredefinedStopsDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: { predefinedStops: [], stationIds: [] },
          onSecondaryAction,
        },
      }),
    });
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');
    await wrapper.vm.onDeleteStop();
    expect(closeDialogSpy).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });
});
