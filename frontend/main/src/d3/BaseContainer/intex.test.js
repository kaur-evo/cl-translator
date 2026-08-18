import BaseContainer from './index';

import { hideTooltip } from '@/helpers/d3Helpers';
import colorConstants from '@/constants/colorConstants';

vi.mock('@/helpers/d3Helpers');
hideTooltip.mockImplementation(vi.fn());

describe('BaseContainer', () => {
  test('if colors are set correctly based on isDark argument', () => {
    const element = document.createElement('div');
    const instance = new BaseContainer({ element, isDark: true });
    expect(instance.colors).toStrictEqual(colorConstants.dark);
    instance.isDark = false;
    expect(instance.colors).toStrictEqual(colorConstants.light);
  });
  test('if container size is obtained correctly from wrapping element', () => {
    const element = document.createElement('div');
    const instance = new BaseContainer({ element });

    expect(instance.containerWidth).toBe(0);
    expect(instance.containerHeight).toBe(0);

    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 200);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 100);

    expect(instance.containerWidth).toBe(200);
    expect(instance.containerHeight).toBe(100);
  });
  test('if margins and chart size is calculated correctly', () => {
    const element = document.createElement('div');
    const instance = new BaseContainer({ element });

    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 200);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 100);

    expect(instance.extraLeftMargin).toBe(0);
    expect(instance.extraRightMargin).toBe(0);
    expect(instance.extraBottomMargin).toBe(0);
    expect(instance.marginLeft).toBe(0);
    expect(instance.marginRight).toBe(0);
    expect(instance.marginTop).toBe(0);
    expect(instance.marginBottom).toBe(0);
    expect(instance.width).toBe(200);
    expect(instance.height).toBe(100);
    instance.leftAxisWidth = 1;
    instance.rightAxisWidth = 2;
    instance.bottomAxisHeight = 3;
    instance.margin = {
      left: 1, right: 2, top: 3, bottom: 4,
    };
    expect(instance.extraLeftMargin).toBe(1);
    expect(instance.extraRightMargin).toBe(2);
    expect(instance.extraBottomMargin).toBe(3);
    expect(instance.marginLeft).toBe(2);
    expect(instance.marginRight).toBe(4);
    expect(instance.marginTop).toBe(3);
    expect(instance.marginBottom).toBe(7);
    expect(instance.height).toBe(90);
    expect(instance.width).toBe(194);
  });
  test('if scale methods behave as expected', () => {
    const element = document.createElement('div');
    const instance = new BaseContainer({ element });

    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 200);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 100);

    instance.defaultXDomain = [0, 1, 2];
    instance.defaultYDomain = [0, 10];
    expect(instance.xRange).toStrictEqual([0, 200]);
    expect(instance.yRange).toStrictEqual([100, 0]);
    instance.setScales();
    expect(instance.xScale(0)).toBe(12.5);
    expect(instance.xScale(2)).toBe(137.5);
    expect(instance.yScale(0)).toBe(100);
    expect(instance.yScale(10)).toBe(0);
    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 400);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 200);
    instance.updateScaleRanges();
    expect(instance.xScale(0)).toBe(25);
    expect(instance.xScale(2)).toBe(275);
    expect(instance.yScale(0)).toBe(200);
    expect(instance.yScale(10)).toBe(0);
  });

  test('if drawSVGContainer results in valid snapshot of BaseContainer', () => {
    const element = document.createElement('div');
    const instance = new BaseContainer({ element });

    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 200);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 100);
    instance.leftAxisWidth = 1;
    instance.rightAxisWidth = 2;
    instance.bottomAxisHeight = 3;
    instance.margin = {
      left: 1, right: 2, top: 3, bottom: 4,
    };
    instance.drawSVGContainer();

    expect(instance.svg.html()).toMatchSnapshot();
  });

  test('that hideTooltip is called on destroy', () => {
    const baseContainer = new BaseContainer({
      element: document.createElement('div'),
      isDark: true,
    });

    expect(hideTooltip).not.toHaveBeenCalled();
    baseContainer.destroy();
    expect(hideTooltip).toHaveBeenCalled();
  });
});
