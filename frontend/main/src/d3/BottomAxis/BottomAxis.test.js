import BottomAxis from './BottomAxis';
import BottomAxisOptions from './BottomAxisOptions';

describe('BottomAxis', () => {
  let mockContext;
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      getLabelHeight: vi.fn(),
      xScale: vi.fn(),
      xzScale: vi.fn(),
      colors: {},
      isDark: false,
      marginTop: 0,
      marginLeft: 0,
      width: 0,
      height: 0,
      bottomAxisHeight: 0,
      xzScaleMap: {},
    };
  });
  describe('diagonalLabelContainerSide', () => {
    it('should calculate the diagonalLabelContainerSide correctly', () => {
      const mockOptions = new BottomAxisOptions({
        labelWidth: 50,
      });
      mockContext.getLabelHeight = vi.fn().mockReturnValue(30);
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelHeight').mockReturnValue(30);

      const expectedValue = (Math.sqrt(2) * (30 / 2)) + (Math.sqrt(2) * (50 / 2));
      expect(bottomAxis.diagonalLabelContainerSide).toBeCloseTo(expectedValue);
    });

    it('should return 0 if labelWidth and labelHeight are 0', () => {
      const mockOptions = new BottomAxisOptions({
        labelWidth: 0,
      });
      mockContext.getLabelHeight = vi.fn().mockReturnValue(0);

      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelHeight').mockReturnValue(0);

      expect(bottomAxis.diagonalLabelContainerSide).toBe(0);
    });
  });

  describe('getBottomAxisHeight', () => {
    it('should return diagonalLabelContainerSide + labelVerticalOffset when diagonalLabels is true', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: true,
        labelVerticalOffset: 10,
      });
      mockContext.getLabelHeight = vi.fn().mockReturnValue(30);
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'diagonalLabelContainerSide', 'get').mockReturnValue(50);

      const expectedValue = 50 + 10;
      expect(bottomAxis.getBottomAxisHeight()).toBe(expectedValue);
    });

    it('should return BOTTOM_AXIS_DEFAULT_HEIGHT when diagonalLabels is false and xzAxisDiagonalLabels is true', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: false,
        xzAxisDiagonalLabels: true,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      expect(bottomAxis.getBottomAxisHeight()).toBe(30); // BOTTOM_AXIS_DEFAULT_HEIGHT
    });

    it('should return BOTTOM_AXIS_DEFAULT_HEIGHT + secondaryLabelsHeight when both diagonalLabels and xzAxisDiagonalLabels are false', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: false,
        xzAxisDiagonalLabels: false,
        secondaryLabelsHeight: 20,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      const expectedValue = 30 + 20; // BOTTOM_AXIS_DEFAULT_HEIGHT + secondaryLabelsHeight
      expect(bottomAxis.getBottomAxisHeight()).toBe(expectedValue);
    });
  });

  describe('getXAxisData', () => {
    it('should return data from context using dataKey if data is not present in options', () => {
      const mockOptions = new BottomAxisOptions({
        dataKey: 'mockDataKey',
      });
      mockContext.mockDataKey = [4, 5, 6];
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      expect(bottomAxis.getXAxisData()).toEqual([4, 5, 6]);
    });
  });

  describe('getLabelString', () => {
    it('should return the input if it is a string', () => {
      const mockOptions = new BottomAxisOptions({});
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      expect(bottomAxis.getLabelString('test')).toBe('test');
    });

    it('should return the input if it is a number', () => {
      const mockOptions = new BottomAxisOptions({});
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      expect(bottomAxis.getLabelString(123)).toBe(123);
    });

    it('should return the result of labelFunc if it is defined and is a function', () => {
      const mockLabelFunc = vi.fn().mockReturnValue('formattedLabel');
      const mockOptions = new BottomAxisOptions({
        labelFunc: mockLabelFunc,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      const input = { key: 'value' };
      expect(bottomAxis.getLabelString(input)).toBe('formattedLabel');
      expect(mockLabelFunc).toHaveBeenCalledWith(input);
    });

    it('should return the value of labelKey from the input object if it exists', () => {
      const mockOptions = new BottomAxisOptions({
        labelKey: 'name',
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      const input = { name: 'labelName' };
      expect(bottomAxis.getLabelString(input)).toBe('labelName');
    });

    it('should return an empty string if none of the conditions are met', () => {
      const mockOptions = new BottomAxisOptions({});
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      const input = { key: 'value' };
      expect(bottomAxis.getLabelString(input)).toBe('');
    });
  });

  describe('truncateBottomAxisLabelText', () => {
    it('should return the labelString if its length is less than 4', () => {
      const mockOptions = new BottomAxisOptions({
        xScaleKey: 'xScale',
        fontSize: 12,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelString').mockReturnValue('abc');

      const result = bottomAxis.truncateBottomAxisLabelText('mockData');
      expect(result).toBe('abc');
    });

    it('should return the labelString if xScale does not have a bandwidth method', () => {
      const mockOptions = new BottomAxisOptions({
        xScaleKey: 'xScale',
        fontSize: 12,
      });
      mockContext.xScale = {};
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelString').mockReturnValue('longLabel');

      const result = bottomAxis.truncateBottomAxisLabelText('mockData');
      expect(result).toBe('longLabel');
    });

    it('should handle cases where labelString is null or undefined', () => {
      const mockOptions = new BottomAxisOptions({
        xScaleKey: 'xScale',
        fontSize: 12,
      });
      mockContext.xScale = {
        bandwidth: vi.fn().mockReturnValue(50),
      };
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelString').mockReturnValue(null);

      const result = bottomAxis.truncateBottomAxisLabelText('mockData');
      expect(result).toBe(null);
    });

    it('should handle cases where labelString is empty', () => {
      const mockOptions = new BottomAxisOptions({
        xScaleKey: 'xScale',
        fontSize: 12,
      });
      mockContext.xScale = {
        bandwidth: vi.fn().mockReturnValue(50),
      };
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'getLabelString').mockReturnValue('');

      const result = bottomAxis.truncateBottomAxisLabelText('mockData');
      expect(result).toBe('');
    });
  });

  describe('getRightClipOffset', () => {
    it('should return half of diagonalLabelContainerSide when diagonalLabels is true', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: true,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'diagonalLabelContainerSide', 'get').mockReturnValue(50);

      const expectedValue = 50 / 2;
      expect(bottomAxis.getRightClipOffset()).toBe(expectedValue);
    });

    it('should return half of diagonalLabelContainerSide when xzAxisDiagonalLabels is true', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: false,
        xzAxisDiagonalLabels: true,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);
      vi.spyOn(bottomAxis, 'diagonalLabelContainerSide', 'get').mockReturnValue(40);

      const expectedValue = 40 / 2;
      expect(bottomAxis.getRightClipOffset()).toBe(expectedValue);
    });

    it('should return 0 when both diagonalLabels and xzAxisDiagonalLabels are false', () => {
      const mockOptions = new BottomAxisOptions({
        diagonalLabels: false,
        xzAxisDiagonalLabels: false,
      });
      const bottomAxis = new BottomAxis(null, mockOptions, mockContext);

      expect(bottomAxis.getRightClipOffset()).toBe(0);
    });
  });
});
