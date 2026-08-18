import BottomAxis from './BottomAxis';

import bottomAxisModule from './index';

function createMockSuperclass() {
  return class Superclass {
    xScale = vi.fn();

    xzScale = vi.fn();

    colors = {};

    isDark = false;

    marginTop = 0;

    marginLeft = 0;

    width = 0;

    height = 0;

    bottomAxisHeight = 0;

    xzScaleMap = {};
  };
}
describe('bottomAxisModule', () => {
  it('should return a class that extends the given superclass', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();
    expect(instance).toBeInstanceOf(Superclass);
  });

  it('should call createBottomAxis with the correct parameters', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();

    const mockElement = {};
    const mockOptions = { option1: 'value1' };

    const createBottomAxisSpy = vi.spyOn(instance, 'createBottomAxis');
    instance.createBottomAxis(mockElement, mockOptions);

    expect(createBottomAxisSpy).toHaveBeenCalledWith(mockElement, mockOptions);
  });

  it('should correctly set xScale and xzScale properties', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();

    const mockXScale = vi.fn();
    const mockXzScale = vi.fn();

    instance.xScale = mockXScale;
    instance.xzScale = mockXzScale;

    expect(instance.xScale).toBe(mockXScale);
    expect(instance.xzScale).toBe(mockXzScale);
  });

  it('should correctly handle dark mode settings', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();

    instance.isDark = true;

    expect(instance.isDark).toBe(true);
  });

  it('should correctly calculate bottomAxisHeight', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();

    instance.bottomAxisHeight = 50;

    expect(instance.bottomAxisHeight).toBe(50);
  });

  it('should return the created BottomAxis instance', () => {
    const Superclass = createMockSuperclass();
    const ExtendedClass = bottomAxisModule(Superclass);
    const instance = new ExtendedClass();

    const mockElement = {};
    const mockOptions = { option1: 'value1' };

    const chart = instance.createBottomAxis(mockElement, mockOptions);

    expect(chart).toBeInstanceOf(BottomAxis);
  });
});
