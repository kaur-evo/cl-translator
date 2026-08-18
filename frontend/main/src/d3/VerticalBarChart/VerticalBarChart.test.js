import VerticalBarChart from './VerticalBarChart';

import getTextColorFromBrightness from '@/helpers/color/getTextColorFromBrightness';

describe('VerticalBarChart', () => {
  describe('getRegularBarWidth', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.xScale = {
        bandwidth: vi.fn(() => 100), // Mock bandwidth
      };
      chart.options = {
        barMaxWidth: 0,
      };
      chart.xScaleFactor = 1;
    });

    it('should return the bandwidth of xScale if barMaxWidth is not set', () => {
      chart.options.barMaxWidth = 0;
      const result = chart.getRegularBarWidth();
      expect(result).toBe(100);
    });

    it('should return the minimum of xScale bandwidth and barMaxWidth divided by xScaleFactor if barMaxWidth is set', () => {
      chart.options.barMaxWidth = 50;
      chart.xScaleFactor = 2;
      const result = chart.getRegularBarWidth();
      expect(result).toBe(25);
    });

    it('should return the xScale bandwidth if barMaxWidth is greater than the bandwidth', () => {
      chart.options.barMaxWidth = 150;
      const result = chart.getRegularBarWidth();
      expect(result).toBe(100);
    });

    it('should return the barMaxWidth divided by xScaleFactor if barMaxWidth is less than the bandwidth', () => {
      chart.options.barMaxWidth = 80;
      chart.xScaleFactor = 2;
      const result = chart.getRegularBarWidth();
      expect(result).toBe(40);
    });
  });

  describe('getBarLabelFill', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.colorScale = vi.fn((index) => `color-${index}`);
    });

    it('should return the color from data.color if it exists', () => {
      const mockData = { color: 'red' };
      const result = chart.getBarLabelFill(mockData, 0);
      expect(result).toBe(getTextColorFromBrightness('red'));
    });

    it('should return the color from data.data.color if data.color does not exist', () => {
      const mockData = { data: { color: 'blue' } };
      const result = chart.getBarLabelFill(mockData, 0);
      expect(result).toBe(getTextColorFromBrightness('blue'));
    });

    it('should return the color from colorScale if neither data.color nor data.data.color exists', () => {
      const mockData = {};
      const result = chart.getBarLabelFill(mockData, 1);
      expect(result).toBe(getTextColorFromBrightness('color-1'));
    });
  });
  describe('getBarLabelText', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.getBarLabelFontSize = vi.fn(() => 12); // Mock font size
      chart.getBarRectWidth = vi.fn(() => vi.fn(() => 50)); // Mock bar width
      chart.yScale = vi.fn((value) => value * 10); // Mock yScale
      chart.options = {
        labelKey: undefined,
      };
    });

    it('should return the text from d.data[labelKey[i]] if labelKey is an array', () => {
      chart.options.labelKey = ['key1', 'key2'];
      const mockData = [10, 5];
      mockData.data = { key1: 'Label1', key2: 'Label2' };
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('Label1');
    });

    it('should return the text from d.data[labelKey] if labelKey is not an array', () => {
      chart.options.labelKey = 'key1';
      const mockData = [10, 5];
      mockData.data = { key1: 'Label1' };
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('Label1');
    });

    it('should return an empty string if labelKey is undefined', () => {
      chart.options.labelKey = undefined;
      const mockData = [10, 5];
      mockData.data = { key1: 'Label1' };
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('');
    });

    it('should return an empty string if textWidth exceeds barWidth', () => {
      chart.getBarRectWidth = vi.fn(() => vi.fn(() => 5)); // Mock small bar width
      const mockData = [10, 5];
      mockData.data = { key1: 'Label1' };
      chart.options.labelKey = 'key1';
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('');
    });

    it('should return an empty string if textHeight exceeds rectHeight', () => {
      const mockData = [10, 9]; // Small height difference
      mockData.data = { key1: 'Label1' };
      chart.options.labelKey = 'key1';
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('');
    });

    it('should return the text if textWidth and textHeight fit within the bar dimensions', () => {
      const mockData = [10, 5];
      mockData.data = { key1: 'Label1' };
      chart.options.labelKey = 'key1';
      const result = chart.getBarLabelText(0)(mockData, 0);
      expect(result).toBe('Label1');
    });
  });

  describe('applyBarLabelAttr', () => {
    let chart;
    let mockText;
    let mockTransition;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      mockTransition = {
        duration: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        transition: vi.fn().mockReturnThis(),
      };
      mockText = {
        attr: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        call: vi.fn((callback) => callback(mockTransition)),
      };
      chart.getBarLabelFontSize = vi.fn(() => 12);
      chart.getBarLabelXPos = vi.fn(() => 50);
      chart.getBarLabelFill = vi.fn(() => 'black');
      chart.getBarLabelText = vi.fn(() => 'Label');
      chart.getBarLabelYPos = vi.fn(() => 100);
      chart.yScale = vi.fn(() => 0);
      chart.options = {
        transitionDuration: 1000,
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set the font-size attribute using getBarLabelFontSize', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.attr).toHaveBeenCalledWith('font-size', chart.getBarLabelFontSize);
    });

    it('should set the text-anchor attribute to "middle"', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.attr).toHaveBeenCalledWith('text-anchor', 'middle');
    });

    it('should set the x attribute using getBarLabelXPos', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.attr).toHaveBeenCalledWith('x', chart.getBarLabelXPos(1));
    });

    it('should set the fill attribute using getBarLabelFill', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.attr).toHaveBeenCalledWith('fill', chart.getBarLabelFill);
    });
    it('should set the text content using getBarLabelText', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.text).toHaveBeenCalledWith(chart.getBarLabelText(1));
    });

    it('should set the y attribute to yScale(0)', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockText.attr).toHaveBeenCalledWith('y', chart.yScale(0));
    });

    it('should call transition with the correct duration and set y attribute during transition', () => {
      chart.applyBarLabelAttr(mockText, 1);
      expect(mockTransition.duration).toHaveBeenCalledWith(chart.options.transitionDuration);
      expect(mockTransition.attr).toHaveBeenCalledWith('y', expect.any(Function));
    });

    it('should correctly calculate the y position during transition', () => {
      chart.applyBarLabelAttr(mockText, 1);
      const yPositionFn = mockTransition.attr.mock.calls.find(([attr]) => attr === 'y')[1];
      const result = yPositionFn({}, 0);
      expect(result).toBe(chart.getBarLabelYPos({}, 0));
    });
  });

  describe('onBarEnter', () => {
    let chart;
    let mockEnter;
    let mockWrapperG;
    let mockEnterG;
    const element = { on: vi.fn() };

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.applyBarLabelAttr = vi.fn();
      chart.applyBarRectAttr = vi.fn();
      chart.onBarUpdate = vi.fn();
      chart.onBarMouseMove = vi.fn(() => 'mousemove-handler');
      chart.onBarMouseOut = vi.fn(() => 'mouseout-handler');

      mockEnterG = {
        attr: vi.fn().mockReturnThis(),
        append: vi.fn().mockImplementation((type) => {
          if (type === 'text' || type === 'path') {
            return element;
          }
          return mockEnterG;
        }),
      };

      mockWrapperG = {
        append: vi.fn(() => mockEnterG),
      };

      mockEnter = {
        append: vi.fn(() => mockWrapperG),
      };

      chart.options = {
        dimensionCount: 2,
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should append a wrapper group element', () => {
      chart.onBarEnter(mockEnter, 1);
      expect(mockEnter.append).toHaveBeenCalledWith('g');
    });

    it('should append a group element with the correct class', () => {
      chart.onBarEnter(mockEnter, 1);
      expect(mockWrapperG.append).toHaveBeenCalledWith('g');
      expect(mockEnterG.attr).toHaveBeenCalledWith('class', 'bar-group-lvl-1');
    });

    it('should append a rect and text element and apply attributes if level >= dimensionCount', () => {
      chart.onBarEnter(mockEnter, 2);
      expect(mockEnterG.append).toHaveBeenCalledWith('path');
      expect(mockEnterG.append).toHaveBeenCalledWith('text');
      expect(chart.applyBarLabelAttr).toHaveBeenCalledWith(element, 2);
      expect(chart.applyBarRectAttr).toHaveBeenCalledWith({ rect: element, isEnter: true, level: 2 });
    });

    it('should add mousemove and mouseout event handlers to the rect if level >= dimensionCount', () => {
      chart.onBarEnter(mockEnter, 2);
      expect(element.on).toHaveBeenCalledWith('mousemove', 'mousemove-handler');
      expect(element.on).toHaveBeenCalledWith('mouseout', 'mouseout-handler');
    });

    it('should append a rect and call onBarUpdate if level < dimensionCount', () => {
      chart.onBarEnter(mockEnter, 1);
      expect(mockEnterG.append).toHaveBeenCalledWith('path');
      expect(chart.onBarUpdate).toHaveBeenCalledWith(mockEnterG, 2);
    });

    it('should call onBarUpdate if level < dimensionCount', () => {
      chart.onBarEnter(mockEnter, 1);
      expect(chart.onBarUpdate).toHaveBeenCalledWith(mockEnterG, 2);
    });
  });

  describe('onBarMerge', () => {
    let chart;
    let mockUpdate;
    let mockText;
    let mockRect;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.applyBarLabelAttr = vi.fn();
      chart.applyBarRectAttr = vi.fn();
      chart.onBarUpdate = vi.fn();

      mockText = {
        length: 0,
      };

      mockRect = {};

      mockUpdate = {
        select: vi.fn((selector) => {
          if (selector === 'text') {
            return mockText;
          }
          if (selector === 'path') {
            return mockRect;
          }
          return null;
        }),
        append: vi.fn((type) => {
          if (type === 'text') {
            mockText.length = 1;
            return mockText;
          }
          return null;
        }),
      };

      chart.options = {
        dimensionCount: 2,
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should append a text element and call applyBarLabelAttr if no text exists and level >= dimensionCount', () => {
      chart.onBarMerge(mockUpdate, 2);
      expect(mockUpdate.select).toHaveBeenCalledWith('text');
      expect(mockUpdate.append).toHaveBeenCalledWith('text');
      expect(chart.applyBarLabelAttr).toHaveBeenCalledWith(mockText, 2);
    });

    it('should select the existing text element and call applyBarLabelAttr if text exists and level >= dimensionCount', () => {
      mockText.length = 1;
      chart.onBarMerge(mockUpdate, 2);
      expect(mockUpdate.select).toHaveBeenCalledWith('text');
      expect(mockUpdate.append).not.toHaveBeenCalledWith('text');
      expect(chart.applyBarLabelAttr).toHaveBeenCalledWith(mockText, 2);
    });

    it('should select the path element and call applyBarRectAttr if level >= dimensionCount', () => {
      chart.onBarMerge(mockUpdate, 2);
      expect(mockUpdate.select).toHaveBeenCalledWith('path');
      expect(chart.applyBarRectAttr).toHaveBeenCalledWith({ rect: mockRect, isEnter: false, level: 2 });
    });

    it('should call onBarUpdate with the update and incremented level if level < dimensionCount', () => {
      chart.onBarMerge(mockUpdate, 1);
      expect(chart.onBarUpdate).toHaveBeenCalledWith(mockUpdate, 2);
    });
  });

  describe('onBarUpdate', () => {
    let chart;
    let mockChildRects;
    let mockEnter;
    let mockUpdate;
    let mockExit;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.calculateZScale = vi.fn();
      chart.onBarEnter = vi.fn();
      chart.onBarMerge = vi.fn();

      mockEnter = {
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
      };

      mockUpdate = {
        select: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
      };

      mockExit = {
        remove: vi.fn(),
      };

      mockChildRects = {
        selectAll: vi.fn(() => ({
          data: vi.fn(() => ({
            join: vi.fn((enterFn, updateFn, exitFn) => {
              enterFn(mockEnter);
              updateFn(mockUpdate);
              exitFn(mockExit);
            }),
          })),
        })),
      };

      chart.options = {
        subGroupKey: 'stackList',
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should call calculateZScale and onBarEnter for enter selection', () => {
      chart.onBarUpdate(mockChildRects, 1, []);
      expect(chart.onBarEnter).toHaveBeenCalledWith(mockEnter, 1);
    });

    it('should call calculateZScale and onBarMerge for update selection', () => {
      chart.onBarUpdate(mockChildRects, 1, []);
      expect(chart.onBarMerge).toHaveBeenCalledWith(mockUpdate, 1);
    });

    it('should call remove for exit selection', () => {
      chart.onBarUpdate(mockChildRects, 1, []);
      expect(mockExit.remove).toHaveBeenCalled();
    });
  });

  describe('getGroupBy', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.context = {
        xzScaleMap: {
          group1: {
            domain: vi.fn(() => ['a', 'b', 'c']),
          },
          group2: {
            domain: vi.fn(() => []),
          },
        },
      };
      chart.options = {
        xzDomainKey: 'domainKey',
      };
    });

    it('should return null if the domain is empty', () => {
      const mockData = { data: { groupingKey: 'group2' } };
      const result = chart.getGroupBy(mockData);
      expect(result).toBeNull();
    });

    it('should return the first element of groupBy if it is an array with a single element', () => {
      const mockData = { data: { groupingKey: 'group1', domainKey: ['value1'] } };
      const result = chart.getGroupBy(mockData);
      expect(result).toBe('value1');
    });

    it('should throw an error if groupBy is an array with more than one element', () => {
      const mockData = { data: { groupingKey: 'group1', domainKey: ['value1', 'value2'] } };
      expect(() => chart.getGroupBy(mockData)).toThrowError('incorrect groupBy value');
    });

    it('should throw an error if groupBy is an array with no elements', () => {
      const mockData = { data: { groupingKey: 'group1', domainKey: [] } };
      expect(() => chart.getGroupBy(mockData)).toThrowError('incorrect groupBy value');
    });
  });

  describe('getRegularBarXPos', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.xScale = vi.fn(vi.fn((key) => key * 10));
      chart.xScale.bandwidth = vi.fn(() => 100); // Mock bandwidth

      chart.options = {
        isStacked: false,
        isGrouped: false,
        barMaxWidth: 0,
        xKey: 'measure',
      };
      chart.xScaleFactor = 1;
    });

    it('should use d directly if isStacked and isGrouped are false', () => {
      const mockData = { measure: 5 };
      const result = chart.getRegularBarXPos(mockData);
      expect(chart.xScale).toHaveBeenCalledWith(5);
      expect(result).toBe(50);
    });

    it('should calculate position without barMaxWidth if barMaxWidth is greater than bandwidth', () => {
      chart.options.barMaxWidth = 150;
      const mockData = { measure: 5 };
      const result = chart.getRegularBarXPos(mockData);
      expect(result).toBe(50);
    });

    it('should divide the result by xScaleFactor if xScaleFactor is greater than 1', () => {
      chart.xScaleFactor = 2;
      const mockData = { measure: 5 };
      const result = chart.getRegularBarXPos(mockData);
      expect(result).toBe(50 / 2);
    });
  });

  describe('enableBarHoverMask', () => {
    let chart;
    let mockBarHoverMask;
    let mockTargetRect;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      mockBarHoverMask = {
        select: vi.fn(() => ({
          attr: vi.fn().mockReturnThis(),
        })),
      };
      mockTargetRect = {
        attr: vi.fn((attr) => {
          const attributes = {
            x: 10,
            y: 20,
            width: 100,
            height: 200,
          };
          return attributes[attr];
        }),
      };
      chart.barHoverMask = mockBarHoverMask;
    });

    it('should do nothing if barHoverMask is not defined', () => {
      chart.barHoverMask = null;
      chart.enableBarHoverMask(mockTargetRect);
      expect(mockBarHoverMask.select).not.toHaveBeenCalled();
    });

    it('should select #verticalBarHoverMaskRect and set its attributes', () => {
      chart.enableBarHoverMask(mockTargetRect);
      expect(mockBarHoverMask.select).toHaveBeenCalledWith(`#${chart.maskRectId}`);
      const selectedElement = mockBarHoverMask.select.mock.results[0].value;
      expect(selectedElement.attr).toHaveBeenCalledWith('x', 10);
      expect(selectedElement.attr).toHaveBeenCalledWith('y', 20);
      expect(selectedElement.attr).toHaveBeenCalledWith('width', 100);
      expect(selectedElement.attr).toHaveBeenCalledWith('height', 200);
    });

    it('should correctly retrieve attributes from targetRect', () => {
      chart.enableBarHoverMask(mockTargetRect);
      expect(mockTargetRect.attr).toHaveBeenCalledWith('x');
      expect(mockTargetRect.attr).toHaveBeenCalledWith('y');
      expect(mockTargetRect.attr).toHaveBeenCalledWith('width');
      expect(mockTargetRect.attr).toHaveBeenCalledWith('height');
    });
  });

  describe('resetBarHoverMask', () => {
    let chart;
    let mockBarHoverMask;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      mockBarHoverMask = {
        select: vi.fn(() => ({
          attr: vi.fn().mockReturnThis(),
          style: vi.fn().mockReturnThis(),
        })),
      };
      chart.barHoverMask = mockBarHoverMask;
      chart.width = 500;
      chart.height = 300;
      chart.options = {
        maskBgColor: 'white',
      };
    });

    it('should do nothing if barHoverMask is not defined', () => {
      chart.barHoverMask = null;
      chart.resetBarHoverMask();
      expect(mockBarHoverMask.select).not.toHaveBeenCalled();
    });

    it('should select #verticalBarMaskOverlay and set its attributes and styles', () => {
      chart.resetBarHoverMask();
      expect(mockBarHoverMask.select).toHaveBeenCalledWith(`#${chart.maskOverlayId}`);
      const selectedElement = mockBarHoverMask.select.mock.results[0].value;
      expect(selectedElement.attr).toHaveBeenCalledWith('x', 0);
      expect(selectedElement.attr).toHaveBeenCalledWith('y', 0);
      expect(selectedElement.attr).toHaveBeenCalledWith('width', 500);
      expect(selectedElement.attr).toHaveBeenCalledWith('height', 300);
      expect(selectedElement.style).toHaveBeenCalledWith('fill', 'white');
      expect(selectedElement.style).toHaveBeenCalledWith('opacity', 0.5);
    });

    it('should select #verticalBarHoverMaskRect and set its attributes and styles', () => {
      chart.resetBarHoverMask();
      expect(mockBarHoverMask.select).toHaveBeenCalledWith(`#${chart.maskRectId}`);
      const selectedElement = mockBarHoverMask.select.mock.results[1].value;
      expect(selectedElement.attr).toHaveBeenCalledWith('x', 0);
      expect(selectedElement.attr).toHaveBeenCalledWith('y', 0);
      expect(selectedElement.attr).toHaveBeenCalledWith('width', 500);
      expect(selectedElement.attr).toHaveBeenCalledWith('height', 300);
      expect(selectedElement.style).toHaveBeenCalledWith('fill', 'white');
      expect(selectedElement.style).toHaveBeenCalledWith('opacity', 1);
    });
  });

  describe('createBarHoverMask', () => {
    let chart;
    let mockElementRef;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      mockElementRef = {
        append: vi.fn(() => ({
          attr: vi.fn().mockReturnThis(),
          append: vi.fn(() => ({
            attr: vi.fn().mockReturnThis(),
          })),
        })),
      };
      chart.elementRef = mockElementRef;
    });

    it('should append a mask element with the correct id', () => {
      chart.createBarHoverMask();
      expect(mockElementRef.append).toHaveBeenCalledWith('mask');
      const maskElement = mockElementRef.append.mock.results[0].value;
      expect(maskElement.attr).toHaveBeenCalledWith('id', chart.maskId);
    });

    it('should append a rect element with id "verticalBarMaskOverlay" to the mask', () => {
      chart.createBarHoverMask();
      const maskElement = mockElementRef.append.mock.results[0].value;
      expect(maskElement.append).toHaveBeenCalledWith('rect');
      const rectElement = maskElement.append.mock.results[0].value;
      expect(rectElement.attr).toHaveBeenCalledWith('id', chart.maskOverlayId);
    });

    it('should append a rect element with id "verticalBarHoverMaskRect" to the mask', () => {
      chart.createBarHoverMask();
      const maskElement = mockElementRef.append.mock.results[0].value;
      expect(maskElement.append).toHaveBeenCalledWith('rect');
      const rectElement = maskElement.append.mock.results[1].value;
      expect(rectElement.attr).toHaveBeenCalledWith('id', chart.maskRectId);
    });
  });

  describe('getBarMaxWidth', () => {
    let chart;

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.options = {
        barMaxWidth: 0,
      };
    });

    it('should return barMaxWidth if it is a number', () => {
      chart.options.barMaxWidth = 50;
      const result = chart.getBarMaxWidth(1);
      expect(result).toBe(50);
    });

    it('should return barMaxWidth[level] if barMaxWidth is an array and level exists', () => {
      chart.options.barMaxWidth = [10, 20, 30];
      const result = chart.getBarMaxWidth(1);
      expect(result).toBe(20);
    });

    it('should throw an error if barMaxWidth[level] does not exist', () => {
      chart.options.barMaxWidth = [10, 20];
      expect(() => chart.getBarMaxWidth(3)).toThrowError('could not resolve barMaxWidth on level');
    });
  });

  describe('getGroupedBarXPos', () => {
    let chart;
    const xzScaleMock = vi.fn(() => 50);

    xzScaleMock.bandwidth = vi.fn(() => 50);
    xzScaleMock.domain = vi.fn(() => ['a', 'b']);
    xzScaleMock.call = vi.fn();

    beforeEach(() => {
      chart = new VerticalBarChart({}, []);
      chart.context = {
        xzScaleMap: {
          group1: xzScaleMock,
        },
      };
      chart.getRegularBarXPos = vi.fn(() => 100);
      chart.getGroupBy = vi.fn(() => 'a');
      chart.getBarMaxWidth = vi.fn(() => 30);
    });

    it('should calculate the grouped bar X position correctly', () => {
      const mockData = { data: { groupingKey: 'group1' } };
      const result = chart.getGroupedBarXPos(mockData, 0, 2);
      const xzScale = chart.context.xzScaleMap.group1;
      expect(chart.getRegularBarXPos).toHaveBeenCalledWith(mockData, 1);
      expect(chart.getGroupBy).toHaveBeenCalledWith(mockData);
      expect(chart.getBarMaxWidth).toHaveBeenCalledWith(2);
      expect(result).toBe(100 + xzScale('a') + ((xzScale.bandwidth() - 30) / 2));
    });

    it('should throw an error if groupingKey is not found in xzScaleMap', () => {
      const mockData = { data: { groupingKey: 'group2' } };
      expect(() => chart.getGroupedBarXPos(mockData, 0, 2)).toThrowError();
    });

    it('should handle cases where xzScale.bandwidth is less than getBarMaxWidth', () => {
      chart.getBarMaxWidth = vi.fn(() => 60);
      const mockData = { data: { groupingKey: 'group1' } };
      const result = chart.getGroupedBarXPos(mockData, 0, 2);
      const xzScale = chart.context.xzScaleMap.group1;
      expect(result).toBe(100 + xzScale('a') + ((xzScale.bandwidth() - 60) / 2));
    });
  });
});
