import { shallowMount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { createTestingPinia } from '@pinia/testing';

import StartExtraShiftContent from './index.vue';

import { useStationStore, useProfileStore } from '@/stores/index';

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const stationStore = useStationStore(pinia);
  const profileStore = useProfileStore(pinia);

  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { zoneId: 'UTC', id: 11 };
  vi.spyOn(profileStore, 'dateFormat', 'get').mockReturnValue(piniaOverrides.dateFormat ?? { short: 'dd.MM' });
  vi.spyOn(profileStore, 'timeFormat', 'get').mockReturnValue(piniaOverrides.timeFormat ?? { luxonShort: 'HH:mm' });

  return shallowMount(StartExtraShiftContent, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    props: options.props,
  });
};

describe('StartExtraShiftContent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-12-02T12:14:00.000Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({}, {
      props: {
        startDate: '2022-12-02',
        startTime: '12:14',
        endDate: '2022-12-02',
        endTime: '22:00',
        shiftDuration: '9h 46m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
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
        startTime: '12:14',
        endDate: '2022-12-02',
        endTime: '22:00',
        shiftDuration: '9h 46m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if nextShiftStartFromRequest exists and hasEndTimeLaterThanNextPlannedShift and startTimeError are true', () => {
    const wrapper = createWrapper({}, {
      global: {
        stubs: { 'shift-times-edit-form': { template: '<div><slot name="info-blocks"></slot></div>' } },
      },
      props: {
        startDate: '2022-12-02',
        startTime: '',
        endDate: '2022-12-03',
        endTime: '10:00',
        shiftDuration: '9h 46m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
        minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
        maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('minStartTime', () => {
    it('returns minStartFromRequest if it is earlier than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minStartTime.toISO()).toBe('2022-12-02T12:00:00.000Z');
    });

    it('returns endDateTime - 24h if minStartFromRequest is later than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-01T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-02T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minStartTime.toISO()).toBe('2022-12-01T22:00:00.000Z');
    });
  });

  describe('maxStartTime', () => {
    it('returns maxStartFromRequest if it is earlier than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-03T07:59:00.000Z');
    });

    it('returns endDateTime - 24h if maxStartFromRequest is later than endDateTime - 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-01T10:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-01T11:00:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-01T22:00:00.000Z');
    });
  });

  describe('minEndTime', () => {
    it('returns minEndFromRequest if it is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-02T12:01:00.000Z');
    });

    it('returns startDateTime + 24h if minEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-03T13:00:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T18:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T18:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minEndTime.toISO()).toBe('2022-12-03T12:14:00.000Z');
    });
  });

  describe('maxEndTime', () => {
    it('returns maxEndFromRequest if it is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxEndTime.toISO()).toBe('2022-12-03T08:00:00.000Z');
    });

    it('returns startDateTime + 24h if maxEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T13:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T13:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxEndTime.toISO()).toBe('2022-12-03T12:14:00.000Z');
    });
  });

  describe('startTimeError', () => {
    it('returns true if startDateTime is missing', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-02T09:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(true);
    });

    it('returns true if startDateTime is not within minStartTime and maxStartTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '10:00',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(true);
    });

    it('returns false if startDateTime is within minStartTime and maxStartTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:30',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          minEndFromRequest: DateTime.fromISO('2022-12-02T12:01:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(false);
    });
  });

  describe('hasEndTimeLaterThanNextPlannedShift', () => {
    it('returns true if endDateTime is later than next planned shift start time', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '10:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-02T09:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.hasEndTimeLaterThanNextPlannedShift).toBe(true);
    });

    it('returns false if endDateTime is earlier than next planned shift start time', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '08:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-02T09:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.hasEndTimeLaterThanNextPlannedShift).toBe(false);
    });
  });

  describe('endTimeError', () => {
    it('returns true if endDateTime is missing', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.endTimeError).toBe(true);
    });

    it('returns true if endDateTime is earlier than startDateTime', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '10:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.endTimeError).toBe(true);
    });
  });

  describe('nextShiftStartInfo', () => {
    it('returns next shift start time in correct format', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.nextShiftStartInfo).toBe('08:00 (03.12)');
    });
  });

  describe('formattedStartRange', () => {
    it('returns start range in correct format', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.formattedStartRange).toBe('12:00 (02.12) - 07:59 (03.12)');
    });
  });

  describe('startRangeDates', () => {
    it('return dates within start range', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          maxStartFromRequest: DateTime.fromISO('2022-12-03T07:59:00.000Z', { zone: 'UTC' }),
          maxEndFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
          nextShiftStartFromRequest: DateTime.fromISO('2022-12-03T08:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startRangeDates).toEqual([
        { name: '02.12', date: '2022-12-02' },
        { name: '03.12', date: '2022-12-03' },
      ]);
    });
  });
});
