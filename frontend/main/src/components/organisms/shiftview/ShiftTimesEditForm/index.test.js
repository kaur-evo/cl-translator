import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftTimesEditForm from './index.vue';

import { useProfileStore } from '@/stores/index';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const profileStore = useProfileStore(pinia);
  profileStore.dateFormat = { short: 'dd.MM' };
  return pinia;
};

const defaultProps = {
  startDate: '02.12',
  startTime: '12:00',
  endDate: '2022-12-02',
  endTime: '21:50',
  startRangeDates: [{ name: '02.12', date: '2022-12-02' }],
  isStartTimeInputDisabled: false,
  isEndTimeInputDisabled: false,
};

describe('ShiftTimesEditForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-12-02T12:14:55.000Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(ShiftTimesEditForm, {
      global: {
        plugins: [createPinia()],
      },
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ShiftTimesEditForm, {
      global: {
        plugins: [createPinia()],
      },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if start time input is disabled', () => {
    const wrapper = shallowMount(ShiftTimesEditForm, {
      global: {
        plugins: [createPinia()],
      },
      props: { ...defaultProps, isStartTimeInputDisabled: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if end time input is disabled', () => {
    const wrapper = shallowMount(ShiftTimesEditForm, {
      global: {
        plugins: [createPinia()],
      },
      props: { ...defaultProps, isEndTimeInputDisabled: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
