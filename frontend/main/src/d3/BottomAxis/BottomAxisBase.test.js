import BottomAxisBase from './BottomAxisBase';
import BottomAxisOptions from './BottomAxisOptions';

describe('BottomAxisBase', () => {
  const mockElement = {};
  const mockOptions = new BottomAxisOptions();
  const mockContext = {
    xScale: {
      bandwidth: vi.fn(),
      range: vi.fn(),
      domain: vi.fn(),
    },
    colors: {
      'tertiary-dark': '#333',
    },
  };

  it('should throw an error when instantiated directly', () => {
    expect(() => new BottomAxisBase(mockElement, mockOptions, mockContext)).toThrow(
      'Abstract class cannot be instantiated directly.',
    );
  });

  it('should throw an error if options is not an instance of BottomAxisOptions', () => {
    class DerivedAxis extends BottomAxisBase {}
    expect(() => new DerivedAxis(mockElement, {}, mockContext)).toThrow(
      'BottomAxisBaseClass options can only be instance of BottomAxisOptions',
    );
  });

  it('should calculate label height based on xScale bandwidth', () => {
    class DerivedAxis extends BottomAxisBase {}
    const instance = new DerivedAxis(mockElement, mockOptions, mockContext);

    mockContext.xScale.bandwidth.mockReturnValue(40);
    expect(instance.getLabelHeight()).toBe(32);

    mockContext.xScale.bandwidth.mockReturnValue(10);
    expect(instance.getLabelHeight()).toBe(16);
  });

  it('should set everyNthTick based on xScale range and zoom event', () => {
    class DerivedAxis extends BottomAxisBase {}
    const instance = new DerivedAxis(mockElement, mockOptions, mockContext);

    mockContext.xScale.range.mockReturnValue([0, 100]);
    mockContext.xScale.domain.mockReturnValue([1, 2, 3, 4, 5]);
    vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
      if (key === 'fontSize') return 10;
      return null;
    });

    instance.setEveryNthTick();
    expect(instance.everyNthTick).toBeGreaterThan(0);

    instance.latestZoomEv = { transform: { k: 2 } };
    instance.setEveryNthTick();
    expect(instance.everyNthTick).toBeGreaterThan(0);
  });

  it('should set tick display based on everyNthTick', () => {
    class DerivedAxis extends BottomAxisBase {}
    const instance = new DerivedAxis(mockElement, mockOptions, mockContext);

    const mockSelection = {
      style: vi.fn(),
    };

    vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
      if (key === 'showAllTicks') return false;
      return null;
    });

    instance.everyNthTick = 2;
    instance.setTickDisplay(mockSelection, 1);
    expect(mockSelection.style).toHaveBeenCalledWith('display', 'none');

    instance.setTickDisplay(mockSelection, 2);
    expect(mockSelection.style).toHaveBeenCalledWith('display', 'initial');
  });

  it('should apply tick line styles', () => {
    class DerivedAxis extends BottomAxisBase {}
    const instance = new DerivedAxis(mockElement, mockOptions, mockContext);

    const mockSelection = {
      select: vi.fn().mockReturnValue({
        style: vi.fn(),
        attr: vi.fn(),
      }),
    };

    vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
      if (key === 'secondaryLabelsHeight') return 20;
      return null;
    });

    instance.applyTickLineStyles(mockSelection, 1, false);
    expect(mockSelection.select).toHaveBeenCalledWith('line');
  });

  it('should apply tick text attributes', () => {
    class DerivedAxis extends BottomAxisBase {}
    const instance = new DerivedAxis(mockElement, mockOptions, mockContext);

    const mockSelection = {
      select: vi.fn().mockReturnValue({
        style: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
      }),
    };

    vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
      if (key === 'fontSize') return 10;
      return null;
    });

    instance.applyTickTextAttr(mockSelection, 1);
    expect(mockSelection.select).toHaveBeenCalledWith('text:not(.secondary-label)');
  });
});
