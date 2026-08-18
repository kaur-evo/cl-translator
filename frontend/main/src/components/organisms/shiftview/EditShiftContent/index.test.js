import { shallowMount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { createTestingPinia } from '@pinia/testing';

import EditShiftContent from './index.vue';

import { useStationStore, useProfileStore, useShiftStore, useShiftviewTimelineStore } from '@/stores/index';

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const stationStore = useStationStore(pinia);
  const profileStore = useProfileStore(pinia);
  const shiftStore = useShiftStore(pinia);
  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);

  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { zoneId: 'utc', id: 11 };
  vi.spyOn(profileStore, 'dateFormat', 'get').mockReturnValue(piniaOverrides.dateFormat ?? { short: 'dd.MM' });
  vi.spyOn(profileStore, 'timeFormat', 'get').mockReturnValue(piniaOverrides.timeFormat ?? { luxonShort: 'HH:mm' });
  shiftStore.shift = piniaOverrides.shift ?? { shiftId: 1, startTimeISO: '2022-12-02T12:00:00.000Z', endTimeISO: '2022-12-02T22:00:00.000Z' };
  shiftStore.isShiftRunning = piniaOverrides.isShiftRunning ?? false;
  vi.spyOn(shiftviewTimelineStore, 'slicesByType', 'get').mockReturnValue(piniaOverrides.slicesByType ?? {
    products: [
      { sliceStartTmISO: '2022-12-02T12:01:00.000Z', sliceEndTmISO: '2022-12-02T12:02:00.000Z' },
      { sliceStartTmISO: '2022-12-02T21:58:00.000Z', sliceEndTmISO: '2022-12-02T21:59:00.000Z' },
    ],
    productChanges: [],
  });

  return shallowMount(EditShiftContent, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    props: options.props,
  });
};

describe('EditShiftContent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-12-03T12:14:55.000Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({}, {
      props: {
        startDate: '2022-12-02',
        startTime: '12:00',
        endDate: '2022-12-02',
        endTime: '22:00',
        shiftDuration: '10h 0m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({}, {
      global: {
        stubs: { 'shift-times-edit-form': { template: '<div><slot name="info-blocks"></slot></div>' } },
      },
      props: {
        startDate: '2022-12-02',
        startTime: '12:00',
        endDate: '2022-12-02',
        endTime: '22:00',
        shiftDuration: '10h 0m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if startTimeError and endTimeError are true', () => {
    const wrapper = createWrapper({}, {
      global: {
        stubs: { 'shift-times-edit-form': { template: '<div><slot name="info-blocks"></slot></div>' } },
      },
      props: {
        startDate: '2022-12-02',
        startTime: '',
        endDate: '2022-12-02',
        endTime: '',
        shiftDuration: '10h 0m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('minStartTime', () => {
    it('returns minStartFromRequest if it is earlier than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minStartTime.toISO()).toBe('2022-12-02T12:00:00.000Z');
    });

    it('returns endDateTime - 24h if minStartFromRequest is later than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-01T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-01T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minStartTime.toISO()).toBe('2022-12-01T22:00:00.000Z');
    });
  });

  describe('maxStartTime', () => {
    it('returns rounded down current time if shift without slices is running', () => {
      const wrapper = createWrapper(
        { isShiftRunning: true, slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-03T12:14:00.000Z');
    });

    it('returns shift end time - 1min if it is past shift without slices', () => {
      const wrapper = createWrapper(
        { slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-02T21:59:00.000Z');
    });

    it('returns first product slice time if changeover does not exist', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-02T12:01:00.000Z');
    });

    it('returns first changeover time if it is earlier than first product slice time', () => {
      const wrapper = createWrapper(
        {
          slicesByType: {
            products: [{ sliceStartTmISO: '2022-12-02T12:05:00.000Z', sliceEndTmISO: '2022-12-02T12:06:00.000Z' }],
            productChanges: [{ sliceStartTmISO: '2022-12-02T12:03:00.000Z' }],
          },
        },
        {
          props: {
            endDate: '2022-12-02',
            endTime: '22:00',
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
            minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
            maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-02T12:03:00.000Z');
    });

    it('returns changeover time, if product slices do not exist', () => {
      const wrapper = createWrapper(
        {
          slicesByType: {
            products: [],
            productChanges: [{ sliceStartTmISO: '2022-12-02T12:03:00.000Z' }],
          },
        },
        {
          props: {
            endDate: '2022-12-02',
            endTime: '22:00',
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
            minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
            maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-02T12:03:00.000Z');
    });
  });

  describe('minEndTime', () => {
    it('returns rounded down current time + 1min if shift without slices is running', () => {
      const wrapper = createWrapper(
        { isShiftRunning: true, slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-03T12:15:00.000Z');
    });

    it('returns shift start time + 1min if it is past shift without slices', () => {
      const wrapper = createWrapper(
        { slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-02T12:01:00.000Z');
    });

    it('returns last product slice time', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-02T21:58:00.000Z');
    });

    it('returns last changeover time if it is later than last product slice time', () => {
      const wrapper = createWrapper(
        {
          slicesByType: {
            products: [{ sliceStartTmISO: '2022-12-02T21:56:00.000Z', sliceEndTmISO: '2022-12-02T21:57:00.000Z' }],
            productChanges: [{ sliceStartTmISO: '2022-12-02T21:58:00.000Z' }],
          },
        },
        {
          props: {
            startDate: '2022-12-02',
            startTime: '12:00',
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-02T21:58:00.000Z');
    });
  });

  describe('maxEndTime', () => {
    it('returns maxEndFromRequest if it is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxEndTime.toISO()).toBe('2022-12-02T22:00:00.000Z');
    });

    it('returns startDateTime + 24h if maxEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T13:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxEndTime.toISO()).toBe('2022-12-03T12:00:00.000Z');
    });
  });

  describe('startTimeError', () => {
    it('returns true if startDateTime is missing', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(true);
    });

    it('returns true if startDateTime is not within minStartTime and maxStartTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '10:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(true);
    });

    it('returns false if startDateTime is within minStartTime and maxStartTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:01',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(false);
    });
  });

  describe('hasLatestPossibleEndTimeError', () => {
    it('returns true if endDateTime is later than maxEndTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '22:01',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.hasLatestPossibleEndTimeError).toBe(true);
    });

    it('returns false if endDateTime is earlier than maxEndTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '21:58',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.hasLatestPossibleEndTimeError).toBe(false);
    });
  });

  describe('endTimeError', () => {
    it('returns true if endDateTime is missing', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.endTimeError).toBe(true);
    });

    it('returns true if endDateTime is not within minEndTime and maxEndTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '21:10',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.endTimeError).toBe(true);
    });

    it('returns false if endDateTime is within minEndTime and maxEndTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          endDate: '2022-12-02',
          endTime: '21:59',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.endTimeError).toBe(false);
    });
  });

  describe('formattedStartRange', () => {
    it('returns minStartFromRequest and rounded down current time in correct format if shift without slices is running', () => {
      const wrapper = createWrapper(
        { isShiftRunning: true, slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-03T12:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.formattedStartRange).toBe('12:00 - 12:14 (03.12)');
    });

    it('returns minStartFromRequest and shift end time - 1min in correct format if it is past shift without slices', () => {
      const wrapper = createWrapper(
        { slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.formattedStartRange).toBe('12:00 - 21:59 (02.12)');
    });

    it('returns minStartFromRequest and maxStartFromRequest in correct format', () => {
      const wrapper = createWrapper({}, {
        props: {
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.formattedStartRange).toBe('12:00 - 12:01 (02.12)');
    });
  });

  describe('formattedEndRange', () => {
    it('returns rounded down current time + 1 min and maxEndFromRequest in correct format if shift without slices is running', () => {
      const wrapper = createWrapper(
        { isShiftRunning: true, slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxEndFromRequest: DateTime.fromISO('2022-12-03T14:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.formattedEndRange).toBe('12:15 - 14:00 (03.12)');
    });

    it('returns shift start time + 1 min and maxEndFromRequest in correct format if it is past shift without slices', () => {
      const wrapper = createWrapper(
        { slicesByType: { products: [], productChanges: [] } },
        {
          props: {
            minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
            maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
          },
        },
      );

      expect(wrapper.vm.formattedEndRange).toBe('12:01 - 22:00 (02.12)');
    });

    it('returns minEndFromRequest and maxEndFromRequest in correct format', () => {
      const wrapper = createWrapper({}, {
        props: {
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T21:58:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-02T22:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.formattedEndRange).toBe('21:58 - 22:00 (02.12)');
    });
  });
});
