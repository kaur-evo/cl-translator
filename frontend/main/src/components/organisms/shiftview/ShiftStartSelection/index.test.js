import { shallowMount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { createTestingPinia } from '@pinia/testing';

import ShiftStartSelection from './index.vue';

import { useDeviceStore, useProfileStore } from '@/stores/index';

const defaultProps = {
  minStartFromRequest: DateTime.fromISO('2022-04-23T13:00:00.000Z', { zone: 'UTC' }),
  maxStartFromRequest: DateTime.fromISO('2022-04-23T13:15:00.000Z', { zone: 'UTC' }),
  maxEndFromRequest: DateTime.fromISO('2022-04-23T17:00:00.000Z', { zone: 'UTC' }),
  nextShiftStartFromRequest: DateTime.fromISO('2022-04-23T17:00:00.000Z', { zone: 'UTC' }),
  nextShiftEndFromRequest: DateTime.fromISO('2022-04-23T22:00:00.000Z', { zone: 'UTC' }),
  nextShiftName: 'Evening shift',
};

const defaultPiniaState = {
  station: { lineviewStation: { id: 1, name: 'Station 1', manualShiftName: 'Manual shift' } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const profileStore = useProfileStore(pinia);
  profileStore.dateFormat = overrides.profile?.dateFormat ?? { long: 'dd.MM.yyyy', short: 'dd.MM' };
  profileStore.timeFormat = overrides.profile?.timeFormat ?? {
    short: 'HH:mm', long: 'HH:mm:ss', hour: 'HH', luxonShort: 'HH:mm', luxonLong: 'HH:mm:ss',
  };

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => shallowMount(ShiftStartSelection, {
  global: { plugins: [createPinia(overrides)] },
  props: { ...defaultProps, ...options.props },
});

describe('ShiftStartSelection', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if nextShiftName and plannedShiftRangeInfo exists', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if nextShiftName is missing', () => {
    const wrapper = createWrapper({}, { props: { nextShiftName: null } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if nextShiftStartFromRequest is later than maxEndFromRequest', () => {
    const wrapper = createWrapper({}, { props: { nextShiftStartFromRequest: DateTime.fromISO('2022-04-23T19:00:00.000Z', { zone: 'UTC' }) } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ device: { isMobileView: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
