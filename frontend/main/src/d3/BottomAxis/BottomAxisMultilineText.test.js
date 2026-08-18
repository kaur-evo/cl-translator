import BottomAxisMultilineText from './BottomAxisMultilineText';
import BottomAxisOptions from './BottomAxisOptions';

describe('BottomAxisMultilineText', () => {
  describe('replaceTickTextWithMultiline', () => {
    let mockSelection;

    beforeEach(() => {
      mockSelection = {
        selectAll: vi.fn().mockReturnThis(),
        remove: vi.fn().mockReturnThis(),
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        html: vi.fn().mockReturnThis(),
      };
    });

    it('should remove all .foreignObj elements', () => {
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions());
      instance.replaceTickTextWithMultiline();
      expect(mockSelection.selectAll).toHaveBeenCalledWith('.foreignObj');
      expect(mockSelection.remove).toHaveBeenCalled();
    });

    it('should remove all .foreign-obj elements', () => {
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions());
      instance.replaceTickTextWithMultiline();
      expect(mockSelection.selectAll).toHaveBeenCalledWith('.foreign-obj');
      expect(mockSelection.remove).toHaveBeenCalled();
    });

    it('should remove all text elements', () => {
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions());
      instance.replaceTickTextWithMultiline();
      expect(mockSelection.selectAll).toHaveBeenCalledWith('text');
      expect(mockSelection.remove).toHaveBeenCalled();
    });
  });

  describe('appendTickLabelText', () => {
    let mockSelection;

    beforeEach(() => {
      mockSelection = {
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        html: vi.fn().mockReturnThis(),
      };
    });

    it('should call appendLegacyText when useLegacyLabels is true and diagonalLabels is false', () => {
      const mockAppendLegacyText = vi.fn();
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        useLegacyLabels: true,
        diagonalLabels: false,
      }));

      instance.appendLegacyText = mockAppendLegacyText;

      instance.appendTickLabelText();

      expect(mockAppendLegacyText).toHaveBeenCalled();
    });

    it('should call appendHTMLFormattedText when useLegacyLabels is false', () => {
      const mockAppendHTMLFormattedText = vi.fn();
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        useLegacyLabels: false,
        diagonalLabels: true,
      }));

      instance.appendHTMLFormattedText = mockAppendHTMLFormattedText;

      instance.appendTickLabelText();

      expect(mockAppendHTMLFormattedText).toHaveBeenCalled();
    });

    it('should call appendHTMLFormattedText when useLegacyLabels is true but diagonalLabels is true', () => {
      const mockAppendHTMLFormattedText = vi.fn();
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        useLegacyLabels: true,
        diagonalLabels: true,
      }));

      instance.appendHTMLFormattedText = mockAppendHTMLFormattedText;

      instance.appendTickLabelText();

      expect(mockAppendHTMLFormattedText).toHaveBeenCalled();
    });

    it('should not throw an error when options are undefined', () => {
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions());

      expect(() => instance.appendTickLabelText()).not.toThrow();
    });
  });

  describe('appendLegacyText', () => {
    let mockSelection;

    beforeEach(() => {
      mockSelection = {
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
      };
    });

    it('should append a text element with correct attributes and text content', () => {
      const mockTextFn = vi.fn().mockImplementation((data) => `Label: ${data}`);
      const mockGetDataObj = vi.fn().mockImplementation((d) => d);
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        labelVerticalOffset: 10,
        textFn: mockTextFn,
      }));

      instance.getDataObj = mockGetDataObj;

      instance.appendLegacyText();

      expect(mockSelection.append).toHaveBeenCalledWith('text');
      expect(mockSelection.attr).toHaveBeenCalledWith('transform', 'translate(0, 10)');
      expect(mockSelection.attr).toHaveBeenCalledWith('text-anchor', 'middle');
      expect(mockSelection.attr).toHaveBeenCalledWith('fill', expect.any(Function));
      expect(mockSelection.text).toHaveBeenCalledWith(expect.any(Function));

      // Verify the text function
      const textFunction = mockSelection.text.mock.calls[0][0];
      expect(textFunction('testData')).toBe('Label: testData');
      expect(mockTextFn).toHaveBeenCalledWith('testData');
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });

    it('should handle null or undefined data gracefully', () => {
      const mockTextFn = vi.fn().mockImplementation((data) => `Label: ${data}`);
      const mockGetDataObj = vi.fn().mockReturnValue(null);
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        labelVerticalOffset: 10,
        textFn: mockTextFn,
      }));

      instance.getDataObj = mockGetDataObj;

      instance.appendLegacyText();

      const textFunction = mockSelection.text.mock.calls[0][0];
      expect(textFunction('testData')).toBe('Label: ');
      expect(mockTextFn).toHaveBeenCalledWith('');
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });
  });

  describe('getLabelYTransform', () => {
    it('should return labelVerticalOffset + secondaryLabelsHeight when isSecondRow is true', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        isSecondRow: true,
        labelVerticalOffset: 10,
        secondaryLabelsHeight: 20,
      }));

      const result = instance.getLabelYTransform();
      expect(result).toBe(30);
    });

    it('should return labelVerticalOffset when isSecondRow is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        isSecondRow: false,
        labelVerticalOffset: 15,
        secondaryLabelsHeight: 20,
      }));

      const result = instance.getLabelYTransform();
      expect(result).toBe(15);
    });
  });

  describe('getClassForHTMLFormattedText', () => {
    it('should return the correct class string when diagonalLabels is true', () => {
      const mockGetLabelTextColor = vi.fn().mockReturnValue('text-primary-text');
      const mockGetJustifyAlign = vi.fn().mockReturnValue('justify-start');
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
      }));

      instance.getLabelTextColor = mockGetLabelTextColor;
      instance.getJustifyAlign = mockGetJustifyAlign;

      const result = instance.getClassForHTMLFormattedText('testData');
      expect(result).toBe('text-body-small text-primary-text justify-start d-flex');
      expect(mockGetLabelTextColor).toHaveBeenCalledWith('testData');
      expect(mockGetJustifyAlign).toHaveBeenCalled();
    });

    it('should return the correct class string when diagonalLabels is false', () => {
      const mockGetLabelTextColor = vi.fn().mockReturnValue('text-secondary-dark');
      const mockGetJustifyAlign = vi.fn().mockReturnValue('justify-center text-center');
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
      }));

      instance.getLabelTextColor = mockGetLabelTextColor;
      instance.getJustifyAlign = mockGetJustifyAlign;

      const result = instance.getClassForHTMLFormattedText('testData');
      expect(result).toBe('text-body-small text-secondary-dark justify-center text-center d-flex');
      expect(mockGetLabelTextColor).toHaveBeenCalledWith('testData');
      expect(mockGetJustifyAlign).toHaveBeenCalled();
    });

    it('should handle undefined or null data gracefully', () => {
      const mockGetLabelTextColor = vi.fn().mockReturnValue('text-secondary-dark');
      const mockGetJustifyAlign = vi.fn().mockReturnValue('justify-center text-center');
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getLabelTextColor = mockGetLabelTextColor;
      instance.getJustifyAlign = mockGetJustifyAlign;

      const result = instance.getClassForHTMLFormattedText(null);
      expect(result).toBe('text-body-small text-secondary-dark justify-center text-center d-flex');
      expect(mockGetLabelTextColor).toHaveBeenCalledWith(null);
      expect(mockGetJustifyAlign).toHaveBeenCalled();
    });
  });

  describe('getHTMLContentForHTMLFormattedText', () => {
    it('should return the correct HTML content when data is defined', () => {
      const mockTextFn = vi.fn().mockImplementation((data) => `HTML Content: ${data}`);
      const mockGetDataObj = vi.fn().mockImplementation((d) => d);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        textFn: mockTextFn,
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getHTMLContentForHTMLFormattedText('testData');
      expect(result).toBe('HTML Content: testData');
      expect(mockTextFn).toHaveBeenCalledWith('testData');
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });

    it('should return an empty string when data is null or undefined', () => {
      const mockTextFn = vi.fn().mockImplementation((data) => `HTML Content: ${data}`);
      const mockGetDataObj = vi.fn().mockReturnValue(null);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        textFn: mockTextFn,
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getHTMLContentForHTMLFormattedText('testData');
      expect(result).toBe('HTML Content: ');
      expect(mockTextFn).toHaveBeenCalledWith('');
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });
  });

  describe('appendHTMLFormattedText', () => {
    let mockSelection;

    beforeEach(() => {
      mockSelection = {
        append: vi.fn().mockReturnThis(),
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        html: vi.fn().mockReturnThis(),
      };
    });

    it('should append a foreignObject element with correct attributes', () => {
      const mockGetLabelXPosition = vi.fn().mockReturnValue(10);
      const mockGetLabelYTransform = vi.fn().mockReturnValue(20);
      const mockGetLabelRotation = vi.fn().mockReturnValue(45);
      const mockGetLabelWidth = vi.fn().mockReturnValue(100);
      const instance = new BottomAxisMultilineText(mockSelection, new BottomAxisOptions({
        labelHeight: 50,
      }));

      instance.getLabelXPosition = mockGetLabelXPosition;
      instance.getLabelYTransform = mockGetLabelYTransform;
      instance.getLabelRotation = mockGetLabelRotation;
      instance.getLabelWidth = mockGetLabelWidth;

      instance.appendHTMLFormattedText();

      expect(mockSelection.append).toHaveBeenCalledWith('svg:foreignObject');
      expect(mockSelection.attr).toHaveBeenCalledWith('transform', 'translate(10, 20) rotate(45, 0, 0)');
      expect(mockSelection.attr).toHaveBeenCalledWith('class', 'foreign-obj');
      expect(mockSelection.attr).toHaveBeenCalledWith('width', 100);
      expect(mockSelection.attr).toHaveBeenCalledWith('height', 50);
      expect(mockSelection.attr).toHaveBeenCalledWith('x', 0);
      expect(mockSelection.attr).toHaveBeenCalledWith('y', 0);
    });
  });

  describe('getLabelWidth', () => {
    it('should return diagonalLabelWidth when diagonalLabels is true', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
        diagonalLabelWidth: 50,
      }));

      const result = instance.getLabelWidth();
      expect(result).toBe(50);
    });

    it('should return widthPerBar multiplied by everyNthTick when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
        widthPerBar: 20,
        everyNthTick: 3,
      }));

      const result = instance.getLabelWidth();
      expect(result).toBe(60);
    });

    it('should handle undefined everyNthTick gracefully', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
        widthPerBar: 20,
      }));

      const result = instance.getLabelWidth();
      expect(result).toBe(20);
    });

    it('should handle both widthPerBar and everyNthTick being undefined gracefully', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
      }));

      const result = instance.getLabelWidth();
      expect(result).toBe(0);
    });
  });

  describe('getLabelRotation', () => {
    it('should return 45 when diagonalLabels is true', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
      }));

      const result = instance.getLabelRotation();
      expect(result).toBe(45);
    });

    it('should return 0 when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
      }));

      const result = instance.getLabelRotation();
      expect(result).toBe(0);
    });

    it('should handle undefined diagonalLabels gracefully', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      const result = instance.getLabelRotation();
      expect(result).toBe(0);
    });
  });

  describe('getLabelXPosition', () => {
    it('should return 2 when diagonalLabels is true', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
      }));

      const result = instance.getLabelXPosition();
      expect(result).toBe(2);
    });

    it('should return negative half of widthPerBar multiplied by everyNthTick when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
        widthPerBar: 20,
        everyNthTick: 3,
      }));

      const result = instance.getLabelXPosition();
      expect(result).toBe(-30);
    });

    it('should handle undefined everyNthTick gracefully when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
        widthPerBar: 20,
      }));

      const result = instance.getLabelXPosition();
      expect(result).toBe(-10);
    });

    it('should handle both widthPerBar and everyNthTick being undefined gracefully when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
      }));

      const result = instance.getLabelXPosition();
      expect(result).toBe(-0);
    });
  });

  describe('getJustifyAlign', () => {
    it('should return "justify-start" when diagonalLabels is true', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
      }));

      const result = instance.getJustifyAlign();
      expect(result).toBe('justify-start');
    });

    it('should return "justify-center text-center" when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
      }));

      const result = instance.getJustifyAlign();
      expect(result).toBe('justify-center text-center');
    });

    it('should handle undefined diagonalLabels gracefully and return "justify-center text-center"', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      const result = instance.getJustifyAlign();
      expect(result).toBe('justify-center text-center');
    });
  });
  describe('getEllipsisTypeClass', () => {
    it('should return "text-truncate" when diagonalLabels is true and widthPerBar is less than labelHeight', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
        widthPerBar: 10,
        labelHeight: 20,
      }));

      const result = instance.getEllipsisTypeClass();
      expect(result).toBe('text-truncate');
    });

    it('should return "line-clamp-2 hyphenate" when diagonalLabels is true but widthPerBar is not less than labelHeight', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
        widthPerBar: 30,
        labelHeight: 20,
      }));

      const result = instance.getEllipsisTypeClass();
      expect(result).toBe('line-clamp-2 hyphenate');
    });

    it('should return "line-clamp-2 hyphenate" when diagonalLabels is false', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: false,
        widthPerBar: 10,
        labelHeight: 20,
      }));

      const result = instance.getEllipsisTypeClass();
      expect(result).toBe('line-clamp-2 hyphenate');
    });

    it('should handle undefined widthPerBar and labelHeight gracefully', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        diagonalLabels: true,
      }));

      const result = instance.getEllipsisTypeClass();
      expect(result).toBe('line-clamp-2 hyphenate');
    });
  });

  describe('getDefined', () => {
    it('should return true when definedKey is not provided', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        definedKey: null,
      }));

      const result = instance.getDefined('testData');
      expect(result).toBe(true);
    });

    it('should return false when the value at definedKey is null', () => {
      const mockGetDataObj = vi.fn().mockReturnValue({ key: null });
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        definedKey: 'key',
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getDefined('testData');
      expect(result).toBe(false);
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });

    it('should return false when the value at definedKey is undefined', () => {
      const mockGetDataObj = vi.fn().mockReturnValue({ key: undefined });
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        definedKey: 'key',
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getDefined('testData');
      expect(result).toBe(false);
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });

    it('should return false when the value at definedKey is false', () => {
      const mockGetDataObj = vi.fn().mockReturnValue({ key: false });
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        definedKey: 'key',
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getDefined('testData');
      expect(result).toBe(false);
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });

    it('should return true when the value at definedKey is a valid value', () => {
      const mockGetDataObj = vi.fn().mockReturnValue({ key: 'validValue' });
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        definedKey: 'key',
      }));

      instance.getDataObj = mockGetDataObj;

      const result = instance.getDefined('testData');
      expect(result).toBe(true);
      expect(mockGetDataObj).toHaveBeenCalledWith('testData');
    });
  });

  describe('getLabelTextColor', () => {
    it('should return "text-primary-text" when getDefined returns true', () => {
      const mockGetDefined = vi.fn().mockReturnValue(true);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLabelTextColor('testData');
      expect(result).toBe('text-primary-text');
      expect(mockGetDefined).toHaveBeenCalledWith('testData');
    });

    it('should return "text-secondary-dark" when getDefined returns false', () => {
      const mockGetDefined = vi.fn().mockReturnValue(false);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLabelTextColor('testData');
      expect(result).toBe('text-secondary-dark');
      expect(mockGetDefined).toHaveBeenCalledWith('testData');
    });

    it('should handle undefined or null data gracefully', () => {
      const mockGetDefined = vi.fn().mockReturnValue(false);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLabelTextColor(null);
      expect(result).toBe('text-secondary-dark');
      expect(mockGetDefined).toHaveBeenCalledWith(null);
    });
  });

  describe('getLegacyLabelTextColor', () => {
    it('should return "#000" when getDefined returns true', () => {
      const mockGetDefined = vi.fn().mockReturnValue(true);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLegacyLabelTextColor('testData');
      expect(result).toBe('#000');
      expect(mockGetDefined).toHaveBeenCalledWith('testData');
    });

    it('should return "#b3b3b3" when getDefined returns false', () => {
      const mockGetDefined = vi.fn().mockReturnValue(false);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLegacyLabelTextColor('testData');
      expect(result).toBe('#b3b3b3');
      expect(mockGetDefined).toHaveBeenCalledWith('testData');
    });

    it('should handle undefined or null data gracefully', () => {
      const mockGetDefined = vi.fn().mockReturnValue(false);
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      instance.getDefined = mockGetDefined;

      const result = instance.getLegacyLabelTextColor(null);
      expect(result).toBe('#b3b3b3');
      expect(mockGetDefined).toHaveBeenCalledWith(null);
    });
  });

  describe('getDataObj', () => {
    it('should return the value from the map when the key exists', () => {
      const mockMap = new Map();
      mockMap.set('key1', 'value1');
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: mockMap,
      }));

      const result = instance.getDataObj('key1');
      expect(result).toBe('value1');
    });

    it('should return null when the key does not exist in the map', () => {
      const mockMap = new Map();
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: mockMap,
      }));

      const result = instance.getDataObj('key1');
      expect(result).toBe(null);
    });

    it('should handle negative numeric keys by converting them to strings', () => {
      const mockMap = new Map();
      mockMap.set('-1', 'negativeValue');
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: mockMap,
      }));

      const result = instance.getDataObj(-1);
      expect(result).toBe('negativeValue');
    });

    it('should return the value from a plain object when the key exists', () => {
      const mockObject = { key1: 'value1' };
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: mockObject,
      }));

      const result = instance.getDataObj('key1');
      expect(result).toBe('value1');
    });

    it('should return null when the key does not exist in a plain object', () => {
      const mockObject = { key1: 'value1' };
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: mockObject,
      }));

      const result = instance.getDataObj('key2');
      expect(result).toBe(null);
    });

    it('should return null when dataMap is undefined', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions());

      const result = instance.getDataObj('key1');
      expect(result).toBe(null);
    });

    it('should handle null dataMap gracefully', () => {
      const instance = new BottomAxisMultilineText(null, new BottomAxisOptions({
        dataMap: null,
      }));

      const result = instance.getDataObj('key1');
      expect(result).toBe(null);
    });
  });
});
