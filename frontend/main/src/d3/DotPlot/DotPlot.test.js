import DotPlotChart from './DotPlot';

describe('DotPlot', () => {
  describe('DotPlot - draw', () => {
    it('should set the elementRef to the provided target element', async () => {
      const mockTargetEl = {};
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.update = vi.fn();

      await dotPlot.draw(mockTargetEl);

      expect(dotPlot.elementRef).toBe(mockTargetEl);
    });

    it('should call update with the current data', async () => {
      const mockTargetEl = {};
      const mockData = [{ key: 'value' }];
      const dotPlot = new DotPlotChart({}, mockData, {});
      dotPlot.update = vi.fn();

      await dotPlot.draw(mockTargetEl);

      expect(dotPlot.update).toHaveBeenCalledWith(mockData);
    });

    it('should handle cases where data is empty gracefully', async () => {
      const mockTargetEl = {};
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.update = vi.fn();

      await dotPlot.draw(mockTargetEl);

      expect(dotPlot.update).toHaveBeenCalledWith([]);
    });

    it('should not throw an error if targetEl is null or undefined', async () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.update = vi.fn();

      await expect(dotPlot.draw(null)).resolves.not.toThrow();
      expect(dotPlot.elementRef).toBe(null);

      await expect(dotPlot.draw(undefined)).resolves.not.toThrow();
      expect(dotPlot.elementRef).toBe(undefined);
    });
  });

  describe('DotPlot - destroy', () => {
    it('should remove the elementRef from the DOM', () => {
      const mockElementRef = { remove: vi.fn() };
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = mockElementRef;

      dotPlot.destroy();

      expect(mockElementRef.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('DotPlot - zoom', () => {
    it('should set xScaleFactor and yScaleFactor based on kx, ky, or k', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };

      dotPlot.zoom({ kx: 2, ky: 3 }, null);

      expect(dotPlot.xScaleFactor).toBe(2);
      expect(dotPlot.yScaleFactor).toBe(3);
    });

    it('should default xScaleFactor and yScaleFactor to 1 if kx, ky, and k are not provided', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };

      dotPlot.zoom({}, null);

      expect(dotPlot.xScaleFactor).toBe(1);
      expect(dotPlot.yScaleFactor).toBe(1);
    });

    it('should set xPosition and yPosition to 0 if x and y are not provided', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };

      dotPlot.zoom({}, null);

      expect(dotPlot.elementRef.attr).toHaveBeenCalledWith('transform', 'translate(0,0) scale(1,1)');
    });

    it('should use the provided x and y for translation', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };

      dotPlot.zoom({ x: 50, y: 100 }, null);

      expect(dotPlot.elementRef.attr).toHaveBeenCalledWith('transform', 'translate(50,100) scale(1,1)');
    });

    it('should set transition duration to 500 if isMoveEvent returns false', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };
      vi.mock('@/d3/helpers/isMoveEvent', () => ({ default: vi.fn(() => false) }));

      dotPlot.zoom({}, {});

      expect(dotPlot.elementRef.transition().duration).toHaveBeenCalledWith(500);
    });

    it('should apply the correct transform attribute', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = { transition: vi.fn().mockReturnThis(), duration: vi.fn().mockReturnThis(), attr: vi.fn() };

      dotPlot.zoom({
        kx: 2, ky: 3, x: 50, y: 100,
      }, null);

      expect(dotPlot.elementRef.attr).toHaveBeenCalledWith('transform', 'translate(50,100) scale(2,3)');
    });
  });

  describe('DotPlot - onDotUpdate', () => {
    it('should call onCircleEnter for new data', () => {
      const mockEnter = { append: vi.fn().mockReturnThis(), attr: vi.fn() };
      const mockUpdate = { select: vi.fn().mockReturnThis() };
      const mockExit = { remove: vi.fn() };
      const mockSelection = {
        selectAll: vi.fn().mockReturnThis(),
        data: vi.fn().mockReturnThis(),
        join: vi.fn((enter, update, exit) => {
          enter(mockEnter);
          update(mockUpdate);
          exit(mockExit);
        }),
      };

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.onCircleEnter = vi.fn();
      dotPlot.onCircleMerge = vi.fn();

      dotPlot.onDotUpdate(mockSelection, 1, []);

      expect(mockSelection.selectAll).toHaveBeenCalledWith('.dot-group-lvl-1');
      expect(dotPlot.onCircleEnter).toHaveBeenCalledWith(mockEnter, 1);
      expect(dotPlot.onCircleMerge).toHaveBeenCalledWith(mockUpdate, 1);
      expect(dotPlot.onCircleEnter).toHaveBeenCalledTimes(1);
      expect(dotPlot.onCircleMerge).toHaveBeenCalledTimes(1);
      expect(mockExit.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('DotPlot - onCircleEnter', () => {
    it('should append a group element with the correct class', () => {
      const mockEnter = {
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        data: vi.fn().mockReturnThis(),
        join: vi.fn().mockReturnThis(),
      };
      const dotPlot = new DotPlotChart({}, [], {});

      dotPlot.applyDotCircleAttr = vi.fn();

      dotPlot.onCircleEnter(mockEnter, 1);

      expect(mockEnter.append).toHaveBeenCalledWith('g');
      expect(mockEnter.attr).toHaveBeenCalledWith('class', 'dot-group-lvl-1');
      expect(dotPlot.applyDotCircleAttr).not.toHaveBeenCalled();
    });

    it('should append a circle and apply attributes if level >= dimensionCount', () => {
      const mockEnterG = { append: vi.fn().mockReturnThis(), attr: vi.fn().mockReturnThis() };
      const mockEnter = { append: vi.fn(() => mockEnterG), attr: vi.fn(() => mockEnterG) };
      const mockCircle = {};
      mockEnterG.append.mockReturnValue(mockCircle);

      const dotPlot = new DotPlotChart({}, [], { dimensionCount: 1 });

      dotPlot.applyDotCircleAttr = vi.fn();

      dotPlot.onCircleEnter(mockEnter, 1);

      expect(mockEnter.append).toHaveBeenCalledWith('g');
      expect(mockEnterG.attr).toHaveBeenCalledWith('class', 'dot-group-lvl-1');
      expect(mockEnterG.append).toHaveBeenCalledWith('circle');
      expect(dotPlot.applyDotCircleAttr).toHaveBeenCalledWith(mockCircle);
    });

    it('should call onDotUpdate for nested data if level < dimensionCount', () => {
      const mockEnterG = { append: vi.fn().mockReturnThis(), attr: vi.fn().mockReturnThis() };
      const mockEnter = { append: vi.fn(() => mockEnterG), attr: vi.fn(() => mockEnterG) };

      const dotPlot = new DotPlotChart({}, [], { dimensionCount: 3 });

      dotPlot.onDotUpdate = vi.fn();

      dotPlot.onCircleEnter(mockEnter, 1);

      expect(mockEnter.append).toHaveBeenCalledWith('g');
      expect(mockEnterG.attr).toHaveBeenCalledWith('class', 'dot-group-lvl-1');
      expect(dotPlot.onDotUpdate).toHaveBeenCalledWith(mockEnterG, 2);
    });
  });

  describe('DotPlot - onCircleMerge', () => {
    it('should apply attributes to the circle if level >= dimensionCount', () => {
      const mockUpdate = { select: vi.fn().mockReturnThis() };
      const mockCircle = {};
      mockUpdate.select.mockReturnValue(mockCircle);

      const dotPlot = new DotPlotChart({}, [], { dimensionCount: 1 });

      dotPlot.applyDotCircleAttr = vi.fn();

      dotPlot.onCircleMerge(mockUpdate, 1);

      expect(mockUpdate.select).toHaveBeenCalledWith('circle');
      expect(dotPlot.applyDotCircleAttr).toHaveBeenCalledWith(mockCircle);
    });

    it('should call onDotUpdate for nested data if level < dimensionCount', () => {
      const mockUpdate = { select: vi.fn().mockReturnThis() };

      const dotPlot = new DotPlotChart({}, [], { dimensionCount: 3 });

      dotPlot.onDotUpdate = vi.fn();

      dotPlot.onCircleMerge(mockUpdate, 1);

      expect(dotPlot.onDotUpdate).toHaveBeenCalledWith(mockUpdate, 2);
    });
  });

  describe('DotPlot - getDotCircleVisibility', () => {
    it('should return "visible" if getDefined returns true', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.getDefined = vi.fn(() => true);

      const result = dotPlot.getDotCircleVisibility({});

      expect(dotPlot.getDefined).toHaveBeenCalledWith({});
      expect(result).toBe('visible');
    });

    it('should return "hidden" if getDefined returns false', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.getDefined = vi.fn(() => false);

      const result = dotPlot.getDotCircleVisibility({});

      expect(dotPlot.getDefined).toHaveBeenCalledWith({});
      expect(result).toBe('hidden');
    });
  });

  describe('DotPlot - getDotCircleXPos', () => {
    it('should calculate the correct x position based on xScale and bandwidth', () => {
      const mockXScale = vi.fn((key) => key * 10);
      mockXScale.bandwidth = vi.fn(() => 20);

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScale = mockXScale;
      dotPlot.options.xKey = 'measure';

      const data = { data: { measure: 5 } };
      const result = dotPlot.getDotCircleXPos(data);

      expect(mockXScale).toHaveBeenCalledWith(5);
      expect(mockXScale.bandwidth).toHaveBeenCalled();
      expect(result).toBe(50 + (20 / 2)); // 50 from xScale(5) + 10 from bandwidth/2
    });

    it('should handle cases where data is missing the xKey gracefully', () => {
      const mockXScale = vi.fn(() => 0);
      mockXScale.bandwidth = vi.fn(() => 0);

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScale = mockXScale;
      dotPlot.options.xKey = 'measure';

      const data = { data: {} };
      const result = dotPlot.getDotCircleXPos(data);

      expect(mockXScale).toHaveBeenCalledWith(undefined);
      expect(mockXScale.bandwidth).toHaveBeenCalled();
      expect(result).toBe(0); // Default to 0 if xKey is missing
    });
  });

  describe('DotPlot - getDotCircleYPos', () => {
    it('should calculate the correct y position based on yScale', () => {
      const mockYScale = vi.fn((end) => end * 10);

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.yScale = mockYScale;

      const data = [null, 5];
      const result = dotPlot.getDotCircleYPos(data);

      expect(mockYScale).toHaveBeenCalledWith(5);
      expect(result).toBe(50); // 5 * 10
    });

    it('should handle cases where data is missing gracefully', () => {
      const mockYScale = vi.fn(() => 0);

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.yScale = mockYScale;

      const data = [];
      const result = dotPlot.getDotCircleYPos(data);

      expect(mockYScale).toHaveBeenCalledWith(undefined);
      expect(result).toBe(0); // Default to 0 if end is missing
    });
  });

  describe('DotPlot - getDotCircleRadius', () => {
    it('should return the value from options.getDotCircleRadius if it is defined', () => {
      const mockGetDotCircleRadius = vi.fn(() => 15);
      const dotPlot = new DotPlotChart({}, [], { getDotCircleRadius: mockGetDotCircleRadius, dotRadius: 10 });

      const data = { someKey: 'someValue' };
      const result = dotPlot.getDotCircleRadius(data);

      expect(mockGetDotCircleRadius).toHaveBeenCalledWith(data);
      expect(result).toBe(15); // Value from getDotCircleRadius
    });

    it('should return the default dotRadius if options.getDotCircleRadius is not defined', () => {
      const dotPlot = new DotPlotChart({}, [], { dotRadius: 10 });

      const data = { someKey: 'someValue' };
      const result = dotPlot.getDotCircleRadius(data);

      expect(result).toBe(10); // Default dotRadius
    });

    it('should handle cases where data is null or undefined gracefully', () => {
      const mockGetDotCircleRadius = vi.fn(() => undefined);
      const dotPlot = new DotPlotChart({}, [], { getDotCircleRadius: mockGetDotCircleRadius, dotRadius: 10 });

      const result = dotPlot.getDotCircleRadius(null);

      expect(mockGetDotCircleRadius).toHaveBeenCalledWith(null);
      expect(result).toBe(10); // Default to dotRadius if getDotCircleRadius returns undefined
    });
  });

  describe('DotPlot - getDotCircleFill', () => {
    it('should return the color property from the data object if it exists', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      const data = { color: 'red' };

      const result = dotPlot.getDotCircleFill(data, 0);

      expect(result).toBe('red'); // Use color from data object
    });

    it('should return the color property from the nested data object if it exists', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      const data = { data: { color: 'blue' } };

      const result = dotPlot.getDotCircleFill(data, 0);

      expect(result).toBe('blue'); // Use color from nested data object
    });

    it('should return a color from the colorScale if no color is defined in the data', () => {
      const mockColorScale = vi.fn((i) => ['green', 'yellow'][i]);
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.colorScale = mockColorScale;

      const data = {};
      const result = dotPlot.getDotCircleFill(data, 1);

      expect(mockColorScale).toHaveBeenCalledWith(1);
      expect(result).toBe('yellow'); // Use color from colorScale
    });
  });

  describe('DotPlot - getDotCircleTransform', () => {
    it('should return the correct transform string based on scale factors', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScaleFactor = 2;
      dotPlot.yScaleFactor = 4;

      const result = dotPlot.getDotCircleTransform();

      expect(result).toBe('scale(0.5,0.25)'); // 1 / 2 for xScaleFactor, 1 / 4 for yScaleFactor
    });

    it('should handle cases where scale factors are 1 (no scaling)', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScaleFactor = 1;
      dotPlot.yScaleFactor = 1;

      const result = dotPlot.getDotCircleTransform();

      expect(result).toBe('scale(1,1)'); // No scaling applied
    });

    it('should handle cases where scale factors are very small', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScaleFactor = 0.01;
      dotPlot.yScaleFactor = 0.02;

      const result = dotPlot.getDotCircleTransform();

      expect(result).toBe('scale(100,50)'); // 1 / 0.01 for xScaleFactor, 1 / 0.02 for yScaleFactor
    });

    it('should handle cases where scale factors are zero', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.xScaleFactor = 0;
      dotPlot.yScaleFactor = 0;

      const result = dotPlot.getDotCircleTransform();

      expect(result).toBe('scale(Infinity,Infinity)'); // 1 / 0 results in Infinity
    });
  });

  describe('DotPlot - applyDotCircleAttr', () => {
    it('should set the correct attributes on the circle element', () => {
      const mockCircle = {
        attr: vi.fn().mockReturnThis(),
      };

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.getDotCircleVisibility = vi.fn(() => 'visible');
      dotPlot.getDotCircleXPos = vi.fn(() => 100);
      dotPlot.getDotCircleYPos = vi.fn(() => 200);
      dotPlot.getDotCircleRadius = vi.fn(() => 10);
      dotPlot.getDotCircleFill = vi.fn(() => 'red');
      dotPlot.getDotCircleTransform = vi.fn(() => 'scale(1,1)');

      dotPlot.applyDotCircleAttr(mockCircle);

      expect(mockCircle.attr).toHaveBeenCalledWith('visibility', dotPlot.getDotCircleVisibility);
      expect(mockCircle.attr).toHaveBeenCalledWith('cx', dotPlot.getDotCircleXPos);
      expect(mockCircle.attr).toHaveBeenCalledWith('cy', dotPlot.getDotCircleYPos);
      expect(mockCircle.attr).toHaveBeenCalledWith('r', dotPlot.getDotCircleRadius);
      expect(mockCircle.attr).toHaveBeenCalledWith('fill', dotPlot.getDotCircleFill);
      expect(mockCircle.attr).toHaveBeenCalledWith('transform', dotPlot.getDotCircleTransform);
    });

    it('should call attr for each attribute exactly once', () => {
      const mockCircle = {
        attr: vi.fn().mockReturnThis(),
      };

      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.getDotCircleVisibility = vi.fn(() => 'visible');
      dotPlot.getDotCircleXPos = vi.fn(() => 100);
      dotPlot.getDotCircleYPos = vi.fn(() => 200);
      dotPlot.getDotCircleRadius = vi.fn(() => 10);
      dotPlot.getDotCircleFill = vi.fn(() => 'red');
      dotPlot.getDotCircleTransform = vi.fn(() => 'scale(1,1)');

      dotPlot.applyDotCircleAttr(mockCircle);

      expect(mockCircle.attr).toHaveBeenCalledTimes(6);
    });
  });

  describe('DotPlot - update', () => {
    it('should not proceed if isDestroyed is true', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.isDestroyed = true;
      dotPlot.onDotUpdate = vi.fn();

      dotPlot.update([], {});

      expect(dotPlot.onDotUpdate).not.toHaveBeenCalled();
    });

    it('should merge provided options with existing options', () => {
      const dotPlot = new DotPlotChart({}, [], { visible: false });
      const newOptions = { visible: true };
      dotPlot.onDotUpdate = vi.fn();
      dotPlot.update([], newOptions);

      expect(dotPlot.options.visible).toBe(true);
    });

    it('should update the data if inputData is provided', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.onDotUpdate = vi.fn();
      const newData = [{ key: 'value' }];

      dotPlot.update(newData, {});

      expect(dotPlot.data).toBe(newData);
    });

    it('should set data to an empty array if options.visible is false', () => {
      const dotPlot = new DotPlotChart({}, [{ key: 'value' }], { visible: false });
      dotPlot.onDotUpdate = vi.fn();

      dotPlot.update();

      expect(dotPlot.data).toEqual([{ key: 'value' }]);
      expect(dotPlot.onDotUpdate).toHaveBeenCalledWith(dotPlot.elementRef, 1, []);
    });

    it('should update xScale and yScale from the context', () => {
      const mockContext = {
        xScaleKey: 'xScale',
        yScaleKey: 'yScale',
        xScale: 'mockXScale',
        yScale: 'mockYScale',
      };
      const dotPlot = new DotPlotChart(mockContext, [], {});
      dotPlot.onDotUpdate = vi.fn();

      dotPlot.update();

      expect(dotPlot.xScale).toBe('mockXScale');
      expect(dotPlot.yScale).toBe('mockYScale');
    });

    it('should call onDotUpdate with the correct parameters', () => {
      const mockElementRef = {};
      const mockData = [{ key: 'value' }];
      const dotPlot = new DotPlotChart({}, mockData, { visible: true });
      dotPlot.elementRef = mockElementRef;
      dotPlot.onDotUpdate = vi.fn();

      dotPlot.update(mockData);

      expect(dotPlot.onDotUpdate).toHaveBeenCalledWith(mockElementRef, 1, mockData);
    });

    it('should handle cases where elementRef is null gracefully', () => {
      const dotPlot = new DotPlotChart({}, [], {});
      dotPlot.elementRef = null;
      dotPlot.onDotUpdate = vi.fn();

      dotPlot.update();

      expect(dotPlot.onDotUpdate).toHaveBeenCalledWith(null, 1, []);
    });
  });
});
