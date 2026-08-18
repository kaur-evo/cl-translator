import { DateTime } from 'luxon';

import TimelineIndicator from './index';

import colorConstants from '@/constants/colorConstants';

describe('TimelineTimeIndicator', () => {
  describe('TimelineTimeIndicator', () => {
    let element;
    let xScale;
    let dateRange;
    let indicator;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
      xScale = vi.fn(() => 50);

      const now = DateTime.now().toUTC();
      dateRange = [
        now.minus({ hours: 1 }),
        now.plus({ hours: 1 }),
      ];

      indicator = new TimelineIndicator(element, { xScale, dateRange });
    });

    afterEach(() => {
      document.body.innerHTML = '';
      vi.restoreAllMocks();
    });

    it('should not draw if element is null', () => {
      const indicator2 = new TimelineIndicator(null, { xScale, dateRange });
      indicator2.draw();
      expect(element.querySelector('svg')).toBeNull();
    });

    it('should create an SVG group and call update on draw', () => {
      const updateSpy = vi.spyOn(indicator, 'update');
      indicator.draw();
      expect(element.querySelector('svg')).not.toBeNull();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should remove previous SVGs before drawing', () => {
      indicator.draw();
      indicator.draw();
      expect(element.querySelectorAll('svg').length).toBe(1);
    });

    it('should not update if svgGroup is not set', () => {
      const indicator2 = new TimelineIndicator(element, { xScale, dateRange });
      expect(() => indicator2.update()).not.toThrow();
      expect(element.querySelector('line')).toBeNull();
    });

    it('should update dateRange if provided in update', () => {
      indicator.draw();
      const newRange = [
        DateTime.now().minus({ days: 2 }),
        DateTime.now().plus({ days: 2 }),
      ];
      indicator.update({ dateRange: newRange });
      expect(indicator.dateRange).toEqual(newRange);
    });

    it('should draw a line at the correct x position if now is within dateRange', () => {
      indicator.draw();
      const line = element.querySelector('line');
      expect(line).not.toBeNull();
      expect(line.getAttribute('x1')).toBe('50');
      expect(line.getAttribute('x2')).toBe('50');
      expect(line.getAttribute('stroke')).toBe(colorConstants.dark['lw-orange']);
      expect(line.getAttribute('stroke-width')).toBe('3');
      expect(line.getAttribute('pointer-events')).toBe('none');
    });

    it('should clear previous lines on update', () => {
      indicator.draw();
      expect(element.querySelectorAll('line').length).toBe(1);
      indicator.update();
      expect(element.querySelectorAll('line').length).toBe(1);
    });
  });
});
