import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import DonutGraph from './DonutGraph';

import { hideTooltip } from '@/helpers/d3Helpers';

vi.mock('@/helpers/d3Helpers');
hideTooltip.mockImplementation(vi.fn());

describe('DonutGraph', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ createSpy: vi.fn }));
  });

  it('calls hideTooltip on destroy', () => {
    const donutGraph = new DonutGraph({
      element: document.createElement('div'),
      innerCircleData: { value: 0, label: '' },
      data: [],
    });

    expect(hideTooltip).not.toHaveBeenCalled();
    donutGraph.destroy();
    expect(hideTooltip).toHaveBeenCalled();
  });
});
