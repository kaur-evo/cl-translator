
import TimelineRow from './TimelineRow';

vi.mock('d3', async () => {
  const actual = await vi.importActual('d3');
  return {
    ...actual,
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({
        remove: vi.fn(),
      })),
      append: vi.fn(() => ({
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        node: vi.fn(() => ({
          getContext: vi.fn(() => ({
            translate: vi.fn(),
            clearRect: vi.fn(),
            scale: vi.fn(),
            fillRect: vi.fn(),
            getImageData: vi.fn(() => ({
              data: [1, 2, 3, 255],
            })),
          })),
        })),
        append: vi.fn().mockReturnThis(),
        html: vi.fn().mockReturnThis(),

      })),
      on: vi.fn().mockReturnThis(),
      node: vi.fn(() => ({
        getContext: vi.fn(() => ({
          translate: vi.fn(),
          clearRect: vi.fn(),
          scale: vi.fn(),
          fillRect: vi.fn(),
          getImageData: vi.fn(() => ({
            data: [1, 2, 3, 255],
          })),
        })),
      })),
    })),
    pointer: vi.fn(() => [0, 0]),
    timeHour: { every: vi.fn(() => 6) },
    timeDay: { every: vi.fn(() => 1) },
  };
});
vi.mock('luxon', async () => {
  const actual = await vi.importActual('luxon');
  return {
    ...actual,
    DateTime: {
      fromISO: vi.fn((iso) => ({
        setZone: vi.fn().mockReturnThis(),
        toJSDate: vi.fn(() => new Date(iso)),
      })),
    },
  };
});
vi.mock('tinycolor2', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    setAlpha: vi.fn().mockReturnThis(),
    toString: vi.fn(() => '#000000'),
    lighten: vi.fn().mockReturnThis(),
  })),
}));
vi.mock('@/helpers/color/rgbaToHexOverWhite', () => ({
  __esModule: true,
  default: vi.fn(() => '#ffffff'),
}));
vi.mock('@/helpers/html/vIconRawTemplate', () => ({
  __esModule: true,
  default: vi.fn(() => '<svg></svg>'),
}));
vi.mock('@/constants/colorConstants', () => ({
  __esModule: true,
  default: {
    dark: {
      error: '#ff0000',
      'secondary-dark': '#cccccc',
    },
  },
}));
vi.mock('@/helpers/d3Helpers', () => ({
  showTooltip: vi.fn(),
  hideTooltip: vi.fn(),
  getTextWidth: vi.fn(() => 50),
}));
vi.mock('@/helpers/text/truncateText', () => ({
  __esModule: true,
  default: vi.fn((text, len) => text.slice(0, len)),
}));

describe('TimelineRow', () => {
  let opts;
  let element;
  beforeEach(() => {
    element = {
      clientWidth: 100,
      clientHeight: 40,
    };
    opts = {
      tooltipHTMLFunc: vi.fn(),
      element,
      xScale: vi.fn(() => 10),
      zoneId: 'UTC',
      solidGridInterval: 1,
      dashGridInterval: 1,
      data: {
        timeline: [
          {
            startTimeISO: '2024-01-01T00:00:00Z',
            endTimeISO: '2024-01-01T06:00:00Z',
            color: '#123456',
            shiftName: 'ShiftA',
            disabled: false,
            isEmpty: false,
          },
        ],
      },
      stationId: 1,
    };
    window.devicePixelRatio = 1;
    window.ontouchstart = undefined;
  });

  it('should construct with options', () => {
    const row = new TimelineRow(opts);
    expect(row.element).toBe(element);
    expect(row.zoneId).toBe('UTC');
    expect(row.rowHeight).toBe(40);
  });

  it('should initialize and call draw', () => {
    const row = new TimelineRow(opts);
    row.draw = vi.fn();
    row.init();
    expect(row.draw).toHaveBeenCalled();
    expect(row.data.timeline[0]).toHaveProperty('sliceX');
    expect(row.data.timeline[0]).toHaveProperty('sliceWidth');
  });

  it('should calculate slice width and X', () => {
    const row = new TimelineRow(opts);
    row.xScale = vi.fn(() => 10);
    row.zoneId = 'UTC';
    const d = {
      startTimeISO: '2024-01-01T00:00:00Z',
      endTimeISO: '2024-01-01T06:00:00Z',
    };
    expect(typeof row.calcSliceWidth(d, 10)).toBe('number');
    expect(typeof row.calcSliceX(d.startTimeISO)).toBe('number');
  });

  it('should calculate slice text', () => {
    const row = new TimelineRow(opts);
    row.fontSize = 14;
    row.sliceLabelMarginY = 13;
    const d = {
      shiftName: 'ShiftA',
      sliceWidth: 100,
    };
    expect(row.calcSliceText(d)).toBe('ShiftA');
    d.shiftName = 'VeryLongShiftName';
    expect(typeof row.calcSliceText(d)).toBe('string');
    d.shiftName = '';
    expect(row.calcSliceText(d)).toBe('');
  });

  it('should get disabled color', () => {
    const row = new TimelineRow(opts);
    expect(row.getDisabledColor('#000')).toBe('#ffffff');
  });

  it('should draw canvas slices', () => {
    const row = new TimelineRow(opts);
    row.data = {
      timeline: [
        { sliceX: 0, sliceWidth: 10, color: '#123', disabled: false },
        { sliceX: 10, sliceWidth: 10, color: '#456', disabled: true },
      ],
    };
    row.rowHeight = 40;
    row.colorsDataMap = {};
    row.hoverMap = { fillRect: vi.fn() };
    row.slicesContext = { fillRect: vi.fn() };
    row.getDisabledColor = vi.fn(() => '#fff');
    row.drawCanvasSlices();
    expect(Object.keys(row.colorsDataMap).length).toBe(2);
  });

  it('should get target slice', () => {
    const row = new TimelineRow(opts);
    row.colorsDataMap = { '1,2,3': { foo: 1 } };
    row.hoverMap = {
      getImageData: vi.fn(() => ({ data: [1, 2, 3, 255] })),
    };
    expect(row.getTargetSlice({})).toEqual({ foo: 1 });
  });

  it('should handle onSliceHover and onSliceHoverEnd', () => {
    const row = new TimelineRow(opts);
    row.tooltipHTMLFunc = vi.fn();
    row.zoneId = 'UTC';
    row.highlight = { attr: vi.fn().mockReturnThis() };
    row.hoverHtml = { attr: vi.fn().mockReturnThis(), html: vi.fn().mockReturnThis() };
    const slice = { sliceX: 0, sliceWidth: 30, isEmpty: true, disabled: false };
    row.onSliceHover(slice);
    expect(row.highlight.attr).toHaveBeenCalled();
    row.onSliceHoverEnd();
    expect(row.highlight.attr).toHaveBeenCalledWith('opacity', 0);
  });

  it('should add click event listener (non-touch)', () => {
    const row = new TimelineRow(opts);
    row.isTouchDevice = false;
    row.svg = { on: vi.fn().mockReturnThis() };
    row.getTargetSlice = vi.fn(() => ({}));
    row.onClick = vi.fn();
    row.addClickEventListener();
    expect(row.svg.on).toHaveBeenCalled();
  });

  it('should add click event listener (touch)', () => {
    const row = new TimelineRow(opts);
    row.isTouchDevice = true;
    row.svg = { on: vi.fn().mockReturnThis() };
    row.getTargetSlice = vi.fn(() => ({}));
    row.onClick = vi.fn();
    row.onSliceHover = vi.fn();
    row.onSliceHoverEnd = vi.fn();
    row.addClickEventListener();
    expect(row.svg.on).toHaveBeenCalled();
  });

  it('should add mouse move event listener', () => {
    const row = new TimelineRow(opts);
    row.svg = { on: vi.fn().mockReturnThis() };
    row.getTargetSlice = vi.fn(() => ({}));
    row.onSliceHover = vi.fn();
    row.onSliceHoverEnd = vi.fn();
    row.addMouseMoveEventListener();
    expect(row.svg.on).toHaveBeenCalled();
  });

  it('should call onClick (default)', () => {
    const row = new TimelineRow(opts);
    expect(row.onClick({}, {})).toBeUndefined();
  });

  it('should call addCanvas and set canvas properties', () => {
    const row = new TimelineRow(opts);
    row.containerWidth = 100;
    row.containerHeight = 40;
    row.dpi = 2;
    row.element = {
      clientWidth: 100,
      clientHeight: 40,
      appendChild: vi.fn(),
    };
    // d3.select is mocked, so this just ensures no error
    row.addCanvas();
    expect(row.slicesCanvas.attr).toHaveBeenCalledWith('width', 200);
    expect(row.slicesCanvas.attr).toHaveBeenCalledWith('height', 80);
    expect(row.slicesCanvas.style).toHaveBeenCalledWith('width', '100px');
    expect(row.slicesCanvas.style).toHaveBeenCalledWith('height', '40px');
    expect(row.slicesCanvas.style).toHaveBeenCalledWith('position', 'absolute');
  });

  it('should not show icon if sliceWidth <= iconContainerSize', () => {
    const row = new TimelineRow(opts);
    row.tooltipHTMLFunc = vi.fn();
    row.zoneId = 'UTC';
    row.highlight = { attr: vi.fn().mockReturnThis() };
    row.hoverHtml = { attr: vi.fn().mockReturnThis(), html: vi.fn().mockReturnThis() };
    const slice = { sliceX: 0, sliceWidth: 10, isEmpty: true, disabled: false };
    row.onSliceHover(slice);
    expect(row.hoverHtml.attr).toHaveBeenCalledWith('width', 0);
    expect(row.hoverHtml.attr).toHaveBeenCalledWith('opacity', 0);
  });

  it('should set hoverHtml opacity to 0 if slice is disabled', () => {
    const row = new TimelineRow(opts);
    row.tooltipHTMLFunc = vi.fn();
    row.zoneId = 'UTC';
    row.highlight = { attr: vi.fn().mockReturnThis() };
    row.hoverHtml = { attr: vi.fn().mockReturnThis(), html: vi.fn().mockReturnThis() };
    const slice = { sliceX: 0, sliceWidth: 30, isEmpty: false, disabled: true };
    row.onSliceHover(slice);
    expect(row.hoverHtml.attr).toHaveBeenCalledWith('opacity', 0);
  });

  it('should call truncateText if label is too long', () => {
    const row = new TimelineRow(opts);
    row.fontSize = 14;
    row.sliceLabelMarginY = 13;
    const d = {
      shiftName: 'VeryLongShiftName',
      sliceWidth: 20,
    };
    expect(typeof row.calcSliceText(d)).toBe('string');
  });

  it('should return empty string if no shiftName', () => {
    const row = new TimelineRow(opts);
    row.fontSize = 14;
    row.sliceLabelMarginY = 13;
    const d = {
      shiftName: '',
      sliceWidth: 100,
    };
    expect(row.calcSliceText(d)).toBe('');
  });

  it('should call onSliceHoverEnd and hide tooltip', () => {
    const row = new TimelineRow(opts);
    row.highlight = { attr: vi.fn().mockReturnThis() };
    row.hoverHtml = { attr: vi.fn().mockReturnThis() };
    row.onSliceHoverEnd();
    expect(row.highlight.attr).toHaveBeenCalledWith('opacity', 0);
    expect(row.hoverHtml.attr).toHaveBeenCalledWith('opacity', 0);
  });
});
