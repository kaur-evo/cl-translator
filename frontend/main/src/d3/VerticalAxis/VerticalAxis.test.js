import { flushPromises } from '@vue/test-utils';

import BaseContainer from '../BaseContainer/index';

import VerticalAxis from './VerticalAxis';

describe('VerticalAxis', () => {
  let baseInstance;
  beforeEach(() => {
    const element = document.createElement('div');
    vi.spyOn(element, 'clientWidth', 'get').mockImplementation(() => 200);
    vi.spyOn(element, 'clientHeight', 'get').mockImplementation(() => 100);
    baseInstance = new BaseContainer({ element });
    baseInstance.defaultXDomain = [0, 1, 2];
    baseInstance.defaultYDomain = [0, 10];
    baseInstance.drawSVGContainer();
    baseInstance.setScales();
    window.SVGElement.prototype.getBBox = () => ({ width: 30 });
  });
  test('if draw results in valid snapshot of VerticalAxis', async () => {
    const leftAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel', transitionDuration: 0 });
    const rightAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel', axisType: 'axisRight', transitionDuration: 0 });
    await leftAxisInstance.draw();
    await rightAxisInstance.draw();
    await flushPromises();
    expect(baseInstance.svg.html()).toMatchSnapshot();
  });
  test('if draw calls expected methods', () => {
    const leftAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel' });
    const appendContainer = vi.spyOn(leftAxisInstance, 'appendContainer');
    const setVerticalAxisWidth = vi.spyOn(leftAxisInstance, 'setVerticalAxisWidth');
    const addVerticalAxis = vi.spyOn(leftAxisInstance, 'addVerticalAxis');
    leftAxisInstance.draw();
    expect(appendContainer).toBeCalledTimes(1);
    expect(setVerticalAxisWidth).toBeCalledTimes(1);
    expect(addVerticalAxis).toBeCalledTimes(1);
  });
  test('if applyYAxisTickCount calls expected methods', () => {
    const leftAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel' });
    const yAxisGenerator = { ticks: vi.fn(), tickValues: vi.fn() };
    leftAxisInstance.applyYAxisTickCount(yAxisGenerator);
    expect(yAxisGenerator.ticks).toBeCalledTimes(1);
    expect(yAxisGenerator.ticks).toHaveBeenCalledWith(leftAxisInstance.options.ticksCount);
    leftAxisInstance.options.tickValues = [1, 2, 3, 4];
    leftAxisInstance.applyYAxisTickCount(yAxisGenerator);
    expect(yAxisGenerator.tickValues).toBeCalledTimes(1);
    expect(yAxisGenerator.tickValues).toHaveBeenCalledWith(leftAxisInstance.options.tickValues);
  });
  test('if applyYAxisTickFormat calls expected methods', () => {
    const leftAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel' });
    baseInstance.dataType = 'pct';
    const yAxisGenerator = { tickFormat: vi.fn() };
    leftAxisInstance.applyYAxisTickFormat(yAxisGenerator);
    expect(yAxisGenerator.tickFormat).toBeCalledTimes(1);
    expect(yAxisGenerator.tickFormat).toHaveBeenCalledWith(leftAxisInstance.formatPercent);
    leftAxisInstance.options.tickFormat = vi.fn();
    leftAxisInstance.applyYAxisTickFormat(yAxisGenerator);
    expect(yAxisGenerator.tickFormat).toBeCalledTimes(2);
    expect(yAxisGenerator.tickFormat).toHaveBeenCalledWith(leftAxisInstance.options.tickFormat);
  });
  test('if createVerticalAxis calls expected methods', () => {
    const leftAxisInstance = new VerticalAxis(baseInstance.verticalAxes, baseInstance, { axisLabel: 'axisLabel' });
    const applyYAxisTickCount = vi.spyOn(leftAxisInstance, 'applyYAxisTickCount');
    const applyYAxisTickFormat = vi.spyOn(leftAxisInstance, 'applyYAxisTickFormat');
    leftAxisInstance.appendContainer();
    leftAxisInstance.createVerticalAxis(baseInstance.verticalAxes.append('g'));

    expect(applyYAxisTickCount).toHaveBeenCalledTimes(1);
    expect(applyYAxisTickFormat).toHaveBeenCalledTimes(1);
  });
});
