import { shallowMount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { createTestingPinia } from '@pinia/testing';

import StartPlannedShiftContent from './index.vue';

import { useStationStore, useProfileStore } from '@/stores/index';

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const stationStore = useStationStore(pinia);
  const profileStore = useProfileStore(pinia);

  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { zoneId: 'UTC', id: 11 };
  vi.spyOn(profileStore, 'dateFormat', 'get').mockReturnValue(piniaOverrides.dateFormat ?? { short: 'dd.MM' });
  vi.spyOn(profileStore, 'timeFormat', 'get').mockReturnValue(piniaOverrides.timeFormat ?? { luxonShort: 'HH:mm' });

  return shallowMount(StartPlannedShiftContent, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    props: options.props,
  });
};

describe('StartPlannedShiftContent', () => {
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
        nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
        nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if startTimeError is true', () => {
    const wrapper = createWrapper({}, {
      global: {
        stubs: { 'shift-times-edit-form': { template: '<div><slot name="info-blocks"></slot></div>' } },
      },
      props: {
        startDate: '2022-12-02',
        startTime: '',
        endDate: '2022-12-02',
        endTime: '22:00',
        shiftDuration: '9h 46m',
        minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
        nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.minStartTime.toISO()).toBe('2022-12-01T22:00:00.000Z');
    });
  });

  describe('maxStartTime', () => {
    it('returns nextShiftEndFromRequest - 1min if it is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T10:23:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-03T10:22:00.000Z');
    });

    it('returns start time + 24h if nextShiftEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxStartTime.toISO()).toBe('2022-12-03T12:14:00.000Z');
    });
  });

  describe('maxEndTime', () => {
    it('returns nextShiftEndFromRequest if it is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T10:23:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.maxEndTime.toISO()).toBe('2022-12-03T10:23:00.000Z');
    });

    it('returns start time + 24h if nextShiftEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          endDate: '2022-12-02',
          endTime: '22:00',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
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
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startTimeError).toBe(false);
    });
  });

  describe('formattedStartRange', () => {
    it('returns range of minStartFromRequest and nextShiftEndFromRequest - 1min if nextShiftEndFromRequest is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T10:23:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.formattedStartRange).toBe('12:00 (02.12) - 10:22 (03.12)');
    });

    it('returns range of minStartFromRequest and start time + 24h if nextShiftEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.formattedStartRange).toBe('12:00 (02.12) - 12:14 (03.12)');
    });
  });

  describe('startRangeDates', () => {
    it('returns correct dates within range of minStartFromRequest and nextShiftEndFromRequest - 1min if nextShiftEndFromRequest is earlier than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-02T23:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startRangeDates).toEqual([{ name: '02.12', date: '2022-12-02' }]);
    });

    it('returns correct dates within range of minStartFromRequest and start time + 24h if nextShiftEndFromRequest is later than startDateTime + 24h', () => {
      const wrapper = createWrapper({}, {
        props: {
          startDate: '2022-12-02',
          startTime: '12:14',
          minStartFromRequest: DateTime.fromISO('2022-12-02T12:00:00.000Z', { zone: 'UTC' }),
          nextShiftEndFromRequest: DateTime.fromISO('2022-12-03T16:00:00.000Z', { zone: 'UTC' }),
        },
      });

      expect(wrapper.vm.startRangeDates).toEqual([
        { name: '02.12', date: '2022-12-02' },
        { name: '03.12', date: '2022-12-03' },
      ]);
    });
  });
});
