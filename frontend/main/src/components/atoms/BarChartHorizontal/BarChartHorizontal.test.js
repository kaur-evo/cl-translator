import BarChartHorizontal from './BarChartHorizontal';

import { hideTooltip } from '@/helpers/d3Helpers';

vi.mock('@/helpers/d3Helpers');
hideTooltip.mockImplementation(vi.fn());

describe('BarChartHorizontal', () => {
  test('that destroy sets animationPromise to null and calls hideTooltip', () => {
    const barChartHorizontal = new BarChartHorizontal({
      element: document.createElement('div'),
      data: [],
      tooltipHTMLFunc: () => {},
    });

    barChartHorizontal.animationPromise = Promise.resolve();
    barChartHorizontal.destroy();

    expect(barChartHorizontal.animationPromise).toBe(null);
    expect(hideTooltip).toHaveBeenCalled();
  });
});
