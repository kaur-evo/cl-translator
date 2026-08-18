import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import Time from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { timeFormats } from '@/constants/formattingConstants';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    station: { lineviewStation: { zoneId: 'Europe/Tallinn' } },
    profile: { currentUser: { timeFormat: timeFormats['24H'] } },
  },
});

describe('Time', () => {
  vi.useFakeTimers();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  it('renders correctly', () => {
    const wrapper = mount(Time, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with large prop', () => {
    const wrapper = mount(Time, {
      global: { plugins: [createPinia()] },
      props: {
        large: true,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  test('that timer is set on creation', () => {
    const wrapper = mount(Time, {
      global: { plugins: [createPinia()] },

    });

    expect(wrapper.vm.timer).not.toBe(null);
    expect(wrapper.vm.timer).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.timer.cbFun).toBe(wrapper.vm.getTime);
    expect(wrapper.vm.timer.delay).toBe(1000);
  });

  test('that timer fn is called every second', () => {
    const wrapper = mount(Time, {
      global: { plugins: [createPinia()] },

    });
    const spy = vi.spyOn(wrapper.vm.timer, 'cbFun');
    const secondsPassed = 4;
    vi.advanceTimersByTime(secondsPassed * 1000);
    expect(spy).toHaveBeenCalledTimes(secondsPassed);
  });

  test('that timer is cleared on beforeUnmount and cb function is not called after that', () => {
    const wrapper = mount(Time, {
      global: { plugins: [createPinia()] },

    });

    const spy = vi.spyOn(wrapper.vm.timer, 'cbFun');
    wrapper.unmount();
    expect(wrapper.vm.timer).toBe(null);

    const secondsPassed = 4;
    vi.advanceTimersByTime(secondsPassed * 1000);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
