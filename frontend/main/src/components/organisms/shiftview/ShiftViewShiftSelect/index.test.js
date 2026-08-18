import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewShiftSelect from './index.vue';

import { useShiftStore, useProfileStore } from '@/stores/index';

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const shiftStore = useShiftStore(pinia);
  const profileStore = useProfileStore(pinia);
  shiftStore.shift = { id: 23, shiftName: 'Test shift', shiftDate: '2020-01-20' };
  shiftStore.isShiftRunning = true;
  profileStore.language = 'en';

  return shallowMount(ShiftViewShiftSelect, {
    global: { plugins: [pinia] },
    ...options,
  });
};

const propsDefault = {
  titleClass: 'title',
  status: 'online',
  large: false,
  compact: false,
  compactOffline: false,
};

describe('ShiftViewShiftSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when large is true', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, large: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when compact is true', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, compact: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when offline', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, status: 'offline' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when compactOffline is true and offline', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, status: 'offline', compactOffline: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that formattedShiftDate returns date without year, if selected shift is in current year', () => {
    vi.setSystemTime(new Date('2020-12-12T12:34:33'));
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.formattedShiftDate).toBe('Monday 20.01');
  });

  test('that formattedShiftDate returns date with year, if selected shift is not in current year', () => {
    vi.setSystemTime(new Date('2024-01-01T12:34:33'));
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.formattedShiftDate).toBe('Monday 20.01.2020');
  });
});
