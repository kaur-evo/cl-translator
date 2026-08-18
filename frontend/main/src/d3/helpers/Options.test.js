import Options from './Options';

describe('Options', () => {
  it('should initialize with defaults and options', () => {
    const defaults = { a: 1, b: 2 };
    const options = { b: 3, c: 4 };
    const instance = new Options(options, defaults);

    expect(instance.defaults).toEqual(defaults);
    expect(instance.options).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should get an option value', () => {
    const defaults = { a: 1 };
    const options = { a: 2 };
    const instance = new Options(options, defaults);

    expect(instance.get('a')).toBe(2);
  });

  it('should throw an error when getting an undefined key', () => {
    const defaults = { a: 1 };
    const instance = new Options({}, defaults);

    expect(() => instance.get('b')).toThrow('Option b is not defined in defaults');
  });

  it('should set an option value', () => {
    const defaults = { a: 1 };
    const instance = new Options({}, defaults);

    instance.set('a', 3);
    expect(instance.get('a')).toBe(3);
  });

  it('should throw an error when setting an undefined key', () => {
    const defaults = { a: 1 };
    const instance = new Options({}, defaults);

    expect(() => instance.set('b', 2)).toThrow('Option b is not defined in defaults');
  });

  it('should update multiple options', () => {
    const defaults = { a: 1, b: 2 };
    const instance = new Options({}, defaults);

    instance.update({ a: 3, b: 4 });
    expect(instance.options).toEqual({ a: 3, b: 4 });
  });

  it('should throw an error when updating an undefined key', () => {
    const defaults = { a: 1 };
    const instance = new Options({}, defaults);

    expect(() => instance.update({ b: 2 })).toThrow('Option b is not defined in defaults');
  });

  it('should clone the instance', () => {
    const defaults = { a: 1 };
    const options = { a: 2 };
    const instance = new Options(options, defaults);

    const clone = instance.clone();
    expect(clone).not.toBe(instance);
    expect(clone.defaults).toEqual(instance.defaults);
    expect(clone.options).toEqual(instance.options);
  });
});
