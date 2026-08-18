import CustomInterval from './CustomInterval';

describe('CustomInterval', () => {
  vi.useFakeTimers();
  test('that CustomIntercal constructor creates a instance with correct data', () => {
    const fun = vi.fn();
    const interval = new CustomInterval(fun, 1000);
    expect(interval.cbFun).toBe(fun);
    expect(interval.delay).toBe(1000);
    expect(interval.interval).toBe(null);
  });

  test('that set sets interval and returns the instance', () => {
    const fun = vi.fn();
    const interval = new CustomInterval(fun, 1000);
    const instance = interval.set();
    expect(instance).toBe(interval);
    expect(interval.interval).not.toBe(null);
  });

  test('that cb function is called 4 times when 4*delay has passed', () => {
    const fun = vi.fn();
    const delay = 1000;
    new CustomInterval(fun, delay).set();
    vi.advanceTimersByTime(delay * 4);
    expect(fun).toBeCalledTimes(4);
  });

  test('that clear sets interval to null', () => {
    const interval = new CustomInterval(vi.fn(), 1000).set();
    expect(interval.interval).not.toBe(null);
    interval.clear();
    expect(interval.interval).toBe(null);
  });

  test('that cb function is not called after clear', () => {
    const fun = vi.fn();
    const delay = 1000;
    const interval = new CustomInterval(fun, delay).set();
    vi.advanceTimersByTime(delay * 4);
    expect(fun).toBeCalledTimes(4);
    interval.clear();
    vi.advanceTimersByTime(delay * 4);
    expect(fun).toBeCalledTimes(4);
  });

  test('that createInterval creates instance, sets the interval and returns the instance', () => {
    const fun = vi.fn();
    const delay = 1000;
    const interval = CustomInterval.createInterval(fun, delay);
    expect(interval.cbFun).toBe(fun);
    expect(interval.delay).toBe(delay);
    expect(interval.interval).not.toBe(null);
  });
});
