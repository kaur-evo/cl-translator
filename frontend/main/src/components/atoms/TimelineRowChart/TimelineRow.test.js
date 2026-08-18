
import { pointer } from 'd3';

import TimelineRow from './TimelineRow';

import { showTooltip, hideTooltip } from '@/helpers/d3Helpers';

vi.mock('@/helpers/d3Helpers', () => ({
  showTooltip: vi.fn(),
  hideTooltip: vi.fn(),
}));

vi.mock('d3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    pointer: vi.fn(),
  };
});

describe('TimelineRow', () => {
  let instance;
  let originalWindowOpen;

  beforeEach(() => {
    originalWindowOpen = window.open;
    window.open = vi.fn();

    instance = new TimelineRow({
      tooltipHTMLFunc: vi.fn(),
      element: document.createElement('div'),
      xScale: vi.fn(),
      data: { timeline: [], changeovers: [], shifts: [] },
      stationId: 123,
    });

    instance.draw = vi.fn();
  });

  afterEach(() => {
    window.open = originalWindowOpen;
    vi.clearAllMocks();
  });

  test('that getTargetSlice returns correct slice from colorsDataMap', () => {
    const fakePointer = [10, 20];
    const fakeColor = [1, 2, 3, 255];
    const fakeSlice = { sId: 'slice1' };

    pointer.mockReturnValue(fakePointer);
    instance.hoverMap = {
      getImageData: vi.fn().mockReturnValue({ data: fakeColor }),
    };
    instance.colorsDataMap = {
      '1,2,3': fakeSlice,
    };

    const result = instance.getTargetSlice({});
    expect(instance.hoverMap.getImageData).toHaveBeenCalledWith(10, 20, 1, 1);
    expect(result).toBe(fakeSlice);
  });

  test('that onSliceHover calls showTooltip and sets highlight attributes', () => {
    const activeSlice = { sliceX: 42, sliceWidth: 100 };
    const highlightMock = { attr: vi.fn().mockReturnThis() };
    instance.highlight = highlightMock;

    instance.onSliceHover(activeSlice);

    expect(showTooltip).toHaveBeenCalledWith({
      params: expect.objectContaining({
        ...activeSlice,
        tooltipHTMLFunc: expect.any(Function),
      }),
    });

    expect(highlightMock.attr).toHaveBeenCalledWith('fill', 'black');
    expect(highlightMock.attr).toHaveBeenCalledWith('x', activeSlice.sliceX);
    expect(highlightMock.attr).toHaveBeenCalledWith('width', activeSlice.sliceWidth);
    expect(highlightMock.attr).toHaveBeenCalledWith('y', instance.marginTop);
    expect(highlightMock.attr).toHaveBeenCalledWith('height', instance.rowHeight);
    expect(highlightMock.attr).toHaveBeenCalledWith('opacity', 0.4);
  });

  test('that onSliceHoverEnd calls hideTooltip and sets highlight opacity to 0', () => {
    const highlightMock = { attr: vi.fn().mockReturnThis() };
    instance.highlight = highlightMock;
    instance.onSliceHoverEnd();
    expect(hideTooltip).toHaveBeenCalled();
    expect(highlightMock.attr).toHaveBeenCalledWith('opacity', 0);
  });

  describe('addClickEventListener', () => {
    beforeEach(() => {
      instance.svg = { on: vi.fn((event, handler) => handler({ preventDefault: vi.fn() })) };
      instance.getTargetSlice = vi.fn();
      instance.onSliceHover = vi.fn();
      instance.onSliceHoverEnd = vi.fn();
    });

    it('does nothing if getTargetSlice returns null', () => {
      instance.isTouchDevice = false;
      instance.getTargetSlice.mockReturnValue(null);
      instance.addClickEventListener();
      expect(window.open).not.toHaveBeenCalled();
      expect(instance.onSliceHover).not.toHaveBeenCalled();
    });

    it('does nothing if getTargetSlice returns object without sId', () => {
      instance.isTouchDevice = false;
      instance.getTargetSlice.mockReturnValue({ sId: null });
      instance.addClickEventListener();
      expect(window.open).not.toHaveBeenCalled();
      expect(instance.onSliceHover).not.toHaveBeenCalled();
    });

    it('opens shiftview on click for non-touch device', () => {
      instance.isTouchDevice = false;
      instance.getTargetSlice.mockReturnValue({ sId: 'slice1', stTmISO: '2023-01-01T00:00:00Z' });
      instance.addClickEventListener();
      expect(window.open).toHaveBeenCalledWith(`#/shiftview/${instance.stationId}/slice1`, '_blank');
    });

    it('shows tooltip on click for touch device', () => {
      instance.isTouchDevice = true;
      instance.getTargetSlice.mockReturnValue({ sId: 'slice1', stTmISO: '2023-01-01T00:00:00Z' });
      instance.addClickEventListener();
      expect(instance.onSliceHover).toHaveBeenCalledWith({ sId: 'slice1', stTmISO: '2023-01-01T00:00:00Z' });
    });

    it('opens shiftview and hides tooltip on dblclick for touch device', () => {
      instance.isTouchDevice = true;
      instance.getTargetSlice.mockReturnValue({ sId: 'slice1', stTmISO: '2023-01-01T00:00:00Z' });
      instance.addClickEventListener();
      instance.svg.on.mock.calls[1][1]({ preventDefault: vi.fn() });
      expect(window.open).toHaveBeenCalledWith(`#/shiftview/${instance.stationId}/slice1`, '_blank');
      expect(instance.onSliceHoverEnd).toHaveBeenCalled();
    });
  });

  describe('addMouseMoveEventListener', () => {
    let mockEvent;
    beforeEach(() => {
      instance.svg = { on: vi.fn((event, handler) => handler(mockEvent)) };
      instance.highlight = { attr: vi.fn().mockReturnThis() };
      instance.onSliceHover = vi.fn();
      instance.getTargetSlice = vi.fn();
    });

    it('does nothing if event.target is shift-icon', () => {
      mockEvent = { target: { classList: { contains: (cls) => cls === 'shift-icon' } } };
      instance.getTargetSlice.mockReturnValue({});
      instance.addMouseMoveEventListener();
      expect(instance.getTargetSlice).not.toHaveBeenCalled();
      expect(instance.onSliceHover).not.toHaveBeenCalled();
      expect(instance.highlight.attr).not.toHaveBeenCalled();
    });

    it('shows tooltip if getTargetSlice returns a slice', () => {
      mockEvent = { target: { classList: { contains: () => false } } };
      instance.getTargetSlice.mockReturnValue({ id: 'slice1' });
      instance.addMouseMoveEventListener();
      expect(instance.getTargetSlice).toHaveBeenCalledWith(mockEvent);
      expect(instance.onSliceHover).toHaveBeenCalledWith({ id: 'slice1' });
      expect(instance.highlight.attr).not.toHaveBeenCalledWith('opacity', 0);
    });

    it('sets highlight opacity to 0 if getTargetSlice returns null', () => {
      mockEvent = { target: { classList: { contains: () => false } } };
      instance.getTargetSlice.mockReturnValue(null);
      instance.addMouseMoveEventListener();
      expect(instance.getTargetSlice).toHaveBeenCalledWith(mockEvent);
      expect(instance.onSliceHover).not.toHaveBeenCalled();
      expect(instance.highlight.attr).toHaveBeenCalledWith('opacity', 0);
    });
  });
});
