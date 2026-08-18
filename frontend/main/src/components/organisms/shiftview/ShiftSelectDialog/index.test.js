import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftSelectDialog from './index.vue';

import {
  useShiftStore,
  useStationStore,
  useDeviceStore,
  useGenericDialogStore,
} from '@/stores/index';
import shiftApi from '@/api/shiftApi';

vi.mock('@/api/shiftApi');
const shifts = {
  '2021-01': [{ shiftDate: '2021-01-01', id: 2 }, { shiftDate: '2021-01-02', id: 3 }, { shiftDate: '2021-01-03', id: 4 }],
  '2021-02': [{ shiftDate: '2021-02-10', id: 10 }, { shiftDate: '2021-02-11', id: 11 }],
};
shiftApi.getShifts = ({ startDate }) => shifts[startDate.substring(0, 7)];

const $route = { name: 'shiftview', params: { stationId: 1, shiftId: 2 } };
const push = vi.fn();
const $router = { push };
$router.push.mockResolvedValue();

const createWrapper = ({ storeOverrides = {}, options = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = storeOverrides.shift ?? {
    startTime: '2021-01-01T12:00:00',
    endTime: '2021-01-01T12:01:00',
    shiftDate: '2021-01-01',
    shift: 1,
  };
  shiftStore.firstShiftOfShiftviewStation = storeOverrides.firstShiftOfShiftviewStation ?? { shiftDate: '2020-01-01' };

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? {};

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;
  deviceStore.isMobileLandscape = storeOverrides.isMobileLandscape ?? false;
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? false;

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.allowFullscreen = storeOverrides.allowFullscreen ?? true;

  const wrapper = shallowMount(ShiftSelectDialog, {
    global: { plugins: [pinia], ...options.global },
    ...options,
  });
  return { wrapper, stores: { shiftStore, stationStore, deviceStore, genericDialogStore }, pinia };
};

describe('ShiftSelectDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-23T12:00:00'));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders correctly', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile portait', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        isMobileLandscape: false,
        isMobileView: true,
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile landscape', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        isMobileLandscape: true,
        isMobileView: true,
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that on initial load availableShiftsMap includes visible shift month shifts', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();

    expect(wrapper.vm.availableShiftsMap).toStrictEqual({
      '2021-01': {
        '2021-01-01': [{ shiftDate: '2021-01-01', id: 2 }],
        '2021-01-02': [{ shiftDate: '2021-01-02', id: 3 }],
        '2021-01-03': [{ shiftDate: '2021-01-03', id: 4 }],
      },
    });
  });

  test('that new dates are added to availableShiftsMap on pickerDate change', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, 'setVisibleMonthShifts');
    expect(spy).toHaveBeenCalledTimes(0);
    await wrapper.setData({ pickerDate: '2021-02' });
    expect(spy).toHaveBeenCalledTimes(1);

    await flushPromises();

    expect(wrapper.vm.availableShiftsMap).toStrictEqual({
      '2021-01': {
        '2021-01-01': [{ shiftDate: '2021-01-01', id: 2 }],
        '2021-01-02': [{ shiftDate: '2021-01-02', id: 3 }],
        '2021-01-03': [{ shiftDate: '2021-01-03', id: 4 }],
      },
      '2021-02': {
        '2021-02-10': [{ shiftDate: '2021-02-10', id: 10 }],
        '2021-02-11': [{ shiftDate: '2021-02-11', id: 11 }],
      },
    });
  });

  test('that selectShift with called with shiftId redirects to the selected shift and closes the dialog', async () => {
    const { wrapper } = createWrapper({
      options: { global: { mocks: { $route, $router } } },
    });

    await flushPromises();
    const spy = vi.spyOn(wrapper.vm, 'closeDialog');
    wrapper.vm.selectShift(12);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(1);
  });

  test('that selectShift with called with undefined wont redirect to next shift nor close the dialog', async () => {
    const { wrapper } = createWrapper();

    await flushPromises();
    const spy = vi.spyOn(wrapper.vm, 'closeDialog');
    wrapper.vm.selectShift();
    expect(spy).toHaveBeenCalledTimes(0);
    expect(push).toHaveBeenCalledTimes(0);
  });

  describe('getAllowedDates', () => {
    const { wrapper } = createWrapper();

    it('returns true if view is months', async () => {
      expect(wrapper.vm.getAllowedDates(new Date(), 'months')).toEqual(true);
    });

    it('returns true if view is year', async () => {
      expect(wrapper.vm.getAllowedDates(new Date(), 'year')).toEqual(true);
    });

    it('returns true if view is month and date is in availableShiftsMap', async () => {
      wrapper.vm.pickerDate = '2012-02';
      wrapper.vm.availableShiftsMap = {
        '2012-02': { '2012-02-01': [{ id: 12879 }] },
      };
      expect(wrapper.vm.getAllowedDates(new Date('2012-02-01T12:00:00'), 'month')).toEqual(true);
    });

    it('returns false if view is month and date is not in availableShiftsMap', async () => {
      wrapper.vm.pickerDate = '2012-02';
      wrapper.vm.availableShiftsMap = {
        '2012-02': { '2012-02-01': [{ id: 12879 }] },
      };
      expect(wrapper.vm.getAllowedDates(new Date('2012-02-02T12:00:00'), 'month')).toEqual(false);
      expect(wrapper.vm.getAllowedDates(new Date('2012-03-01T12:00:00'), 'month')).toEqual(false);
    });
  });
});
