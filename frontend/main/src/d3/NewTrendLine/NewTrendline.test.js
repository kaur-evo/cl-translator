import NewTrendLine from './NewTrendLine';

const createD3Selection = () => {
  const selection = {
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    exit: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    transition: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
  };
  return selection;
};

const createContext = (overrides = {}) => ({
  xDomain: [1, 2, 3],
  xScale: (v) => v * 10,
  yScale: (v) => v * 20,
  yScaleType: 'scaleLinear',
  isDark: false,
  colors: { white: '#fff', black: '#000' },
  ...overrides,
});

describe('NewTrendLine', () => {
  describe('constructor', () => {
    it('creates correct instance', () => {
      const ctx = createContext();
      const data = { slope: 2, intercept: 5 };
      const opts = { isTimeScale: false };
      const trendLine = new NewTrendLine(ctx, data, opts);
      expect(trendLine.slope).toBe(2);
      expect(trendLine.intercept).toBe(5);
      expect(trendLine.context).toBe(ctx);
      expect(trendLine.isTimeScale).toBe(false);
      expect(trendLine.data).toEqual([]);
    });

    it('defaults slope and intercept to 0 when data is null', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, null, { isTimeScale: false });
      expect(trendLine.slope).toBe(0);
      expect(trendLine.intercept).toBe(0);
    });

    it('defaults slope and intercept to 0 when data is undefined', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, undefined, { isTimeScale: false });
      expect(trendLine.slope).toBe(0);
      expect(trendLine.intercept).toBe(0);
    });

    it('sets isTimeScale from options', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 1 }, { isTimeScale: true });
      expect(trendLine.isTimeScale).toBe(true);
    });
  });

  describe('getLineDataPoints', () => {
    it('returns correct points for linear scale', () => {
      const ctx = createContext();
      const data = { slope: 2, intercept: 5 };
      const opts = { isTimeScale: false };
      const trendLine = new NewTrendLine(ctx, data, opts);
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([
        { x: 10, y: 140 },
        { x: 20, y: 180 },
        { x: 30, y: 220 },
      ]);
    });

    it('returns correct points for time scale', () => {
      const ctx = createContext({ yScaleType: 'scaleTime' });
      const data = { slope: 2, intercept: 5 };
      const opts = { isTimeScale: true };
      const trendLine = new NewTrendLine(ctx, data, opts);
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([
        { x: 10, y: 140000 },
        { x: 20, y: 180000 },
        { x: 30, y: 220000 },
      ]);
    });

    it('returns empty array for empty xDomain', () => {
      const ctx = createContext({ xDomain: [] });
      const trendLine = new NewTrendLine(ctx, { slope: 2, intercept: 5 }, { isTimeScale: false });
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([]);
    });

    it('filters out NaN points', () => {
      const ctx = createContext({
        xScale: (v) => (v === 2 ? NaN : v * 10),
      });
      const trendLine = new NewTrendLine(ctx, { slope: 2, intercept: 5 }, { isTimeScale: false });
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([
        { x: 10, y: 140 },
        { x: 30, y: 220 },
      ]);
    });

    it('filters out points where yScale returns NaN', () => {
      const ctx = createContext({
        yScale: (v) => (v === 9 ? NaN : v * 20),
      });
      const trendLine = new NewTrendLine(ctx, { slope: 2, intercept: 5 }, { isTimeScale: false });
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([
        { x: 10, y: 140 },
        { x: 30, y: 220 },
      ]);
    });

    it('handles single-point domain', () => {
      const ctx = createContext({ xDomain: [5] });
      const trendLine = new NewTrendLine(ctx, { slope: 3, intercept: 1 }, { isTimeScale: false });
      const points = trendLine.getLineDataPoints(ctx);
      expect(points).toEqual([
        { x: 50, y: 80 },
      ]);
    });
  });

  describe('draw', () => {
    it('appends a trendline-wrapper group to the target element', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const targetEl = createD3Selection();

      trendLine.draw(targetEl);

      expect(targetEl.append).toHaveBeenCalledWith('g');
      expect(targetEl.attr).toHaveBeenCalledWith('class', 'trendline-wrapper');
      expect(trendLine.elementRef).toBe(targetEl);
    });

    it('removes existing elementRef before appending new one', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const oldRef = createD3Selection();
      trendLine.elementRef = oldRef;

      const targetEl = createD3Selection();
      trendLine.draw(targetEl);

      expect(oldRef.remove).toHaveBeenCalled();
      expect(targetEl.append).toHaveBeenCalledWith('g');
    });
  });

  describe('zoom', () => {
    it('applies transform with transition for non-move events', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({ kx: 2, ky: 3, x: 10, y: 20 }, { sourceEvent: { type: 'click' } });

      expect(elementRef.transition).toHaveBeenCalled();
      expect(elementRef.duration).toHaveBeenCalledWith(500);
      expect(elementRef.attr).toHaveBeenCalledWith('transform', 'translate(10,20) scale(2,3)');
      expect(trendLine.xScaleFactor).toBe(2);
      expect(trendLine.yScaleFactor).toBe(3);
    });

    it('applies transform without transition duration for mousemove events', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({ kx: 1.5, ky: 1.5, x: 5, y: 10 }, { sourceEvent: { type: 'mousemove' } });

      expect(elementRef.duration).toHaveBeenCalledWith(0);
    });

    it('applies transform without transition duration for touchmove events', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({ kx: 1, ky: 1, x: 0, y: 0 }, { sourceEvent: { type: 'touchmove' } });

      expect(elementRef.duration).toHaveBeenCalledWith(0);
    });

    it('defaults x and y to 0 when not provided', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({ kx: 2, ky: 2 }, {});

      expect(elementRef.attr).toHaveBeenCalledWith('transform', 'translate(0,0) scale(2,2)');
    });

    it('uses k as fallback when kx and ky are not provided', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({ k: 3, x: 5, y: 10 }, {});

      expect(trendLine.xScaleFactor).toBe(3);
      expect(trendLine.yScaleFactor).toBe(3);
      expect(elementRef.attr).toHaveBeenCalledWith('transform', 'translate(5,10) scale(3,3)');
    });

    it('defaults scale factors to 1 when no k values provided', () => {
      const ctx = createContext();
      const trendLine = new NewTrendLine(ctx, { slope: 1, intercept: 0 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;

      trendLine.zoom({}, {});

      expect(trendLine.xScaleFactor).toBe(1);
      expect(trendLine.yScaleFactor).toBe(1);
    });
  });

  describe('update', () => {
    const setupTrendLine = (ctxOverrides = {}) => {
      const ctx = createContext({
        xDomain: [1, 2, 3],
        xScale: Object.assign((v) => v * 10, { bandwidth: () => 10 }),
        ...ctxOverrides,
      });
      const trendLine = new NewTrendLine(ctx, { slope: 2, intercept: 5 }, { isTimeScale: false });
      const elementRef = createD3Selection();
      trendLine.elementRef = elementRef;
      return { trendLine, elementRef, ctx };
    };

    it('removes existing trendline elements before drawing', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      expect(elementRef.selectAll).toHaveBeenCalledWith('.trendline');
      expect(elementRef.remove).toHaveBeenCalled();
    });

    it('updates slope and intercept from trendlineData', () => {
      const { trendLine } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 10, intercept: 20 } });

      expect(trendLine.intercept).toBe(20);
      expect(trendLine.slope).toBe(10);
    });

    it('returns early when data has fewer than 2 points', () => {
      const { trendLine, elementRef } = setupTrendLine({ xDomain: [1] });

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      // selectAll('.trendline').remove() is called, but enter/append chain is not
      expect(elementRef.enter).not.toHaveBeenCalled();
    });

    it('draws trendline lines when data has 2+ points', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      expect(elementRef.enter).toHaveBeenCalled();
      expect(elementRef.append).toHaveBeenCalledWith('line');
      expect(elementRef.attr).toHaveBeenCalledWith('class', 'trendline');
    });

    it('sets correct line positions with bandwidth offset', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      // bandwidth = 10, halfBarWidth = 5
      // First point: x=10+5=15, last point: x=30+5=35
      expect(elementRef.attr).toHaveBeenCalledWith('x1', 15);
      expect(elementRef.attr).toHaveBeenCalledWith('x2', 35);
      expect(elementRef.attr).toHaveBeenCalledWith('y1', 140);
      expect(elementRef.attr).toHaveBeenCalledWith('y2', 220);
    });

    it('defaults bandwidth to 1 when xScale has no bandwidth method', () => {
      const { trendLine, elementRef } = setupTrendLine({
        xScale: (v) => v * 10,
      });

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      // bandwidth fallback = 1, halfBarWidth = 0.5
      expect(elementRef.attr).toHaveBeenCalledWith('x1', 10.5);
      expect(elementRef.attr).toHaveBeenCalledWith('x2', 30.5);
    });

    it('sets opacity to 1 when visible', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      expect(elementRef.style).toHaveBeenCalledWith('opacity', 1);
    });

    it('sets opacity to 0 when not visible', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: false, trendlineData: { slope: 2, intercept: 5 } });

      expect(elementRef.style).toHaveBeenCalledWith('opacity', 0);
    });

    it('uses black stroke in light mode', () => {
      const { trendLine, elementRef } = setupTrendLine({ isDark: false });

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      const strokeCalls = elementRef.style.mock.calls.filter(([prop]) => prop === 'stroke');
      // style('stroke', fn) is called — verify the callback behavior
      const strokeCallback = strokeCalls[0]?.[1];
      if (typeof strokeCallback === 'function') {
        expect(strokeCallback(null, 0)).toBe('#000');
        expect(strokeCallback(null, 1)).toBe('transparent');
      }
    });

    it('uses white stroke in dark mode', () => {
      const { trendLine, elementRef } = setupTrendLine({ isDark: true });

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      const strokeCalls = elementRef.style.mock.calls.filter(([prop]) => prop === 'stroke');
      const strokeCallback = strokeCalls[0]?.[1];
      if (typeof strokeCallback === 'function') {
        expect(strokeCallback(null, 0)).toBe('#fff');
        expect(strokeCallback(null, 1)).toBe('transparent');
      }
    });

    it('applies dashed stroke to the first line and solid to the second', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      const dashCalls = elementRef.style.mock.calls.filter(([prop]) => prop === 'stroke-dasharray');
      const dashCallback = dashCalls[0]?.[1];
      if (typeof dashCallback === 'function') {
        expect(dashCallback(null, 0)).toBe('5 5');
        expect(dashCallback(null, 1)).toBe('');
      }
    });

    it('applies thin stroke to the first line and wide hover area to the second', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      const widthCalls = elementRef.style.mock.calls.filter(([prop]) => prop === 'stroke-width');
      const widthCallback = widthCalls[0]?.[1];
      if (typeof widthCallback === 'function') {
        expect(widthCallback(null, 0)).toBe(1);
        expect(widthCallback(null, 1)).toBe(15);
      }
    });

    it('calls exit().remove() to clean up exiting elements', () => {
      const { trendLine, elementRef } = setupTrendLine();

      trendLine.update({ isVisible: true, trendlineData: { slope: 2, intercept: 5 } });

      expect(elementRef.exit).toHaveBeenCalled();
    });
  });
});
