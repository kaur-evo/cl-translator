import { select } from 'd3';

import XZAxis from './XZAxis';
import BottomAxisOptions from './BottomAxisOptions';

describe('XZAxis', () => {
  let xzAxis;
  let mockElement;
  let mockOptions;
  let mockContext;

  beforeEach(() => {
    mockElement = document.createElement('svg');
    mockOptions = new BottomAxisOptions();
    mockContext = { xScale: {}, colors: { 'tertiary-dark': '#333' }, isDark: false };
    xzAxis = new XZAxis(mockElement, mockOptions, mockContext);
    xzAxis.xScale = vi.fn(() => 0);
    xzAxis.xScale.bandwidth = vi.fn(() => 0);
    xzAxis.xzScale = vi.fn(() => 0);
    xzAxis.xzScale.bandwidth = vi.fn(() => 0);
  });

  describe('applyTickLine', () => {
    it('should append a line with correct attributes to the selection', () => {
      const selection = select(document.createElement('g'));
      xzAxis.applyTickLine(selection);

      const line = selection.select('line');
      expect(line.attr('x1')).toBe('0');
      expect(line.attr('y1')).toBe('0');
      expect(line.attr('x2')).toBe('0');
      expect(line.attr('y2')).toBe('8');
      expect(line.attr('stroke')).toBe('#333');
    });
  });

  describe('setEveryNthTick', () => {
    it('should calculate everyNthTick correctly based on the scale range and domain', () => {
      const mockScale = {
        range: () => [0, 300],
        domain: () => ['A', 'B', 'C', 'D', 'E'],
      };
      vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
        if (key === 'fontSize') return 12;
        throw new Error(`Unknown key: ${key}`);
      });

      xzAxis.setEveryNthTick(mockScale);

      expect(xzAxis.everyNthTick).toBe(Math.ceil(3 / (300 / (12 * 5 * 0.5))));
    });

    it('should handle cases where scale range is small', () => {
      const mockScale = {
        range: () => [0, 50],
        domain: () => ['A', 'B', 'C'],
      };
      vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
        if (key === 'fontSize') return 10;
        throw new Error(`Unknown key: ${key}`);
      });

      xzAxis.setEveryNthTick(mockScale);

      expect(xzAxis.everyNthTick).toBe(Math.ceil(3 / (50 / (10 * 3 * 0.5))));
    });

    it('should handle cases where scale domain is empty', () => {
      const mockScale = {
        range: () => [0, 300],
        domain: () => [],
      };
      vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
        if (key === 'fontSize') return 12;
        throw new Error(`Unknown key: ${key}`);
      });

      xzAxis.setEveryNthTick(mockScale);

      expect(xzAxis.everyNthTick).toBe(0);
    });
  });

  describe('apply', () => {
    let mockSelection;
    let mockScale;

    beforeEach(() => {
      mockSelection = select(document.createElement('svg'));
      mockScale = vi.fn(() => 0);
      mockScale.range = vi.fn(() => [0, 300]);
      mockScale.domain = vi.fn(() => ['A', 'B', 'C']);
      mockScale.bandwidth = vi.fn(() => 50);

      vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
        if (key === 'xzAxisEnabled') return true;
        if (key === 'fontSize') return 12;
        if (key === 'multiLineLabelsEnabled') return false;
        if (key === 'showAllTicks') return false;
        throw new Error(`Unknown key: ${key}`);
      });
    });

    it('should remove existing .xz-axis elements', () => {
      mockSelection.append('g').attr('class', 'xz-axis');
      expect(mockSelection.selectAll('.xz-axis').size()).toBe(1);

      xzAxis.apply(mockSelection, false, mockScale);

      expect(mockSelection.selectAll('.xz-axis').size()).toBe(1);
    });

    it('should not append .xz-axis if xzAxisEnabled is false', () => {
      vi.spyOn(mockOptions, 'get').mockImplementation((key) => {
        if (key === 'xzAxisEnabled') return false;
        throw new Error(`Unknown key: ${key}`);
      });

      xzAxis.apply(mockSelection, false, mockScale);

      expect(mockSelection.selectAll('.xz-axis').size()).toBe(0);
    });

    it('should append .xz-axis for each domain value', () => {
      xzAxis.apply(mockSelection, false, mockScale);

      const axisGroup = mockSelection.select('.xz-axis');
      expect(axisGroup.size()).toBe(1);
      expect(axisGroup.selectAll('.xz-tick').size()).toBe(3);
    });

    it('should set everyNthTick based on the scale', () => {
      const setEveryNthTickSpy = vi.spyOn(xzAxis, 'setEveryNthTick');
      xzAxis.apply(mockSelection, false, mockScale);

      expect(setEveryNthTickSpy).toHaveBeenCalledWith(mockScale);
    });
  });
});
