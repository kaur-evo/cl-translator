import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import timelineApi from '@/api/timelineApi';
import { useProfileStore } from '@/stores/index';

vi.mock('@/api/timelineApi');
timelineApi.getCurrent.mockResolvedValue({ shift: { id: 45 } });

const $router = { push: vi.fn() };
$router.push.mockResolvedValue({});

const createPinia = ({ shiftviewStationUserRole } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      station: { lineviewStation: { id: 1 } },
      shiftNotification: { shiftNotificationVisible: true },
    },
  });
  const profileStore = useProfileStore(pinia);
  profileStore.shiftviewStationUserRole = shiftviewStationUserRole;
  return pinia;
};

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [createPinia()],
    mocks: { $router },
  },
  ...options,
});

const propsDefault = {};

describe('ShiftNotification', () => {
  vi.useFakeTimers();
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

  test('that startTimer sets timer to correct custom interval', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.startTimer();
    expect(wrapper.vm.timer).not.toBe(null);
    expect(wrapper.vm.timer).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.timer.cbFun).toBe(wrapper.vm.decreaseTimerTime);
    expect(wrapper.vm.timer.delay).toBe(1000);
  });

  test('that after timer has been started, cb function is called every second', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.startTimer();
    const spy = vi.spyOn(wrapper.vm.timer, 'cbFun');
    const secondsPassed = 4;
    vi.advanceTimersByTime(secondsPassed * 1000);
    expect(spy).toHaveBeenCalledTimes(secondsPassed);
  });

  test('that cancelTimer clears timer and cb function is not called after that', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.startTimer();
    const spy = vi.spyOn(wrapper.vm.timer, 'cbFun');
    const secondsPassed = 4;
    vi.advanceTimersByTime(secondsPassed * 1000);
    expect(spy).toHaveBeenCalledTimes(secondsPassed);
    wrapper.vm.cancelTimer();
    expect(wrapper.vm.timer).toBe(null);
    vi.advanceTimersByTime(secondsPassed * 2 * 1000);
    expect(spy).toHaveBeenCalledTimes(secondsPassed);
  });

  test('that if redirectTimer is greater than 0, redirectToLatestShift is not called and redirectTimer is incremented by 1 on decreaseTimerTime', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.startTimer();
    const spy = vi.spyOn(wrapper.vm, 'redirectToLatestShift');
    wrapper.vm.decreaseTimerTime();
    expect(spy).toHaveBeenCalledTimes(0);
    expect(wrapper.vm.redirectTimer).toBe(179);
  });

  test('that if redirectTimer is 0, then redirectToLatestShift is called, timer is reset and no cb function is called after that', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.startTimer();
    const redirectSpy = vi.spyOn(wrapper.vm, 'redirectToLatestShift');
    const cbSpy = vi.spyOn(wrapper.vm.timer, 'cbFun');
    wrapper.vm.$options.watch.redirectTimer.call(wrapper.vm, 0);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.timer).toBe(null);
    expect(wrapper.vm.redirectTimer).toBe(180);
    vi.advanceTimersByTime(3000);
    expect(cbSpy).toHaveBeenCalledTimes(0);
  });
});
