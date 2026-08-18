import {
  scaleBand,
} from 'd3';

import PositionCalculator from './PositionCalculator';

const yBand = scaleBand().domain([
  '2019-11-25T06:00:00.000Z',
  '2019-11-25T07:00:00.000Z',
  '2019-11-25T08:00:00.000Z',
  '2019-11-25T09:00:00.000Z',
  '2019-11-25T10:00:00.000Z',
]).range([0, 1000]);

describe('PositionCalculator.js', () => {
  let calculator = null;
  beforeEach(() => {
    // 9000 = 2.5h
    const startTime = '2019-11-25T06:00:00.000Z';
    const endTime = '2019-11-25T08:30:00.000Z';
    const demoCurrentShift = {
      startTimeISO: '2019-11-25T06:00:00.000Z',
      endTimeISO: '2019-11-25T16:00:00.000Z',
      id: 1234,
      producedQty: 8423,
    };
    calculator = new PositionCalculator({
      startTime,
      endTime,
      xStart: 0,
      xEnd: 3600,
      yScale: yBand,
      selectedRange: [],
      currentShift: demoCurrentShift,
      timezone: 'UTC',
    });
  });

  it('when no changes has been made', () => {
    expect(calculator.hasChanged()).toBe(false);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when starting bracket has been moved in the stoppage range on x axis', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: 1800, y: 0 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([1800, 0]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:30:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when starting bracket has been moved in the stoppage range on y axis', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: 0, y: 200 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([0, 200]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T07:00:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when ending bracket has been moved in the stoppage range on x axis', () => {
    calculator.onDragStart({ x: 1800, y: 400 });
    calculator.onDrag({ x: 900, y: 400 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([900, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T08:15:00.000Z']);
  });

  it('when starting bracket has been moved outside the range to the left', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: -600, y: 0 });

    expect(calculator.hasChanged()).toBe(false);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when starting bracket has been moved outside the range to the the top and right', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: 900, y: -200 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([900, 0]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:15:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when ending bracket has been movedoutside the stoppage range on x axis', () => {
    calculator.onDragStart({ x: 1800, y: 400 });
    calculator.onDrag({ x: 2400, y: 400 });

    expect(calculator.hasChanged()).toBe(false);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('when ending bracket has been moved in the stoppage range on y axis', () => {
    calculator.onDragStart({ x: 1800, y: 400 });
    calculator.onDrag({ x: 900, y: 600 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([900, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T08:15:00.000Z']);
  });

  it('end bracket must stay 1 min from start bracket', () => {
    calculator.onDragStart({ x: 1800, y: 400 });
    calculator.onDrag({ x: 0, y: 0 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([0, 0]);
    expect(calculator.getEndPosition()).toEqual([60, 0]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T06:00:00.000Z', '2019-11-25T06:01:00.000Z']);
  });

  it('start bracket must stay 1 min from end bracket', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: 1800, y: 400 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([1740, 400]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T08:29:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  it('start bracket shouldnt go to the previous hour end', () => {
    calculator.onDragStart({ x: 0, y: 0 });
    calculator.onDrag({ x: -200, y: 200 });

    expect(calculator.hasChanged()).toBe(true);
    expect(calculator.getStartPosition()).toEqual([0, 200]);
    expect(calculator.getEndPosition()).toEqual([1800, 400]);
    expect(calculator.getSelectedRange()).toEqual(['2019-11-25T07:00:00.000Z', '2019-11-25T08:30:00.000Z']);
  });

  test('that if endTime is the same as shiftEnd then endHourIdx is the yDomain last element', () => {
    const startTime = '2019-11-25T06:00:00.000Z';
    const endTime = '2019-11-25T12:00:00.000Z';
    const demoCurrentShift = {
      startTimeISO: '2019-11-25T06:00:00.000Z',
      endTimeISO: '2019-11-25T12:00:00.000Z',
      id: 1234,
      producedQty: 8423,
    };
    const y = scaleBand().domain([
      '2019-11-25T06:00:00.000Z',
      '2019-11-25T07:00:00.000Z',
      '2019-11-25T08:00:00.000Z',
      '2019-11-25T09:00:00.000Z',
      '2019-11-25T10:00:00.000Z',
      '2019-11-25T11:00:00.000Z',
    ]).range([0, 1000]);
    calculator = new PositionCalculator({
      startTime,
      endTime,
      xStart: 0,
      xEnd: 3600,
      yScale: y,
      selectedRange: [],
      currentShift: demoCurrentShift,
      timezone: 'UTC',
    });
    expect(calculator.endHourIdx).toBe(y.domain().length - 1);
  });

  test('that getTimePosition returns correct position', () => {
    expect(calculator.getTimePosition('2019-11-25T07:25:00.000Z')).toEqual({ x: 60 * 25, y: 200 });
  });

  test('that setSelectedRange sets range and selectedStart and selectedEnd', () => {
    const start = '2019-11-25T07:25:00.000Z';
    const end = '2019-11-25T07:45:00.000Z';
    calculator.setSelectedRange(start, end);
    expect(calculator.getSelectedRange()).toEqual([start, end]);
    expect(calculator.selectedStart).toBe(start);
    expect(calculator.selectedEnd).toBe(end);
  });

  test('that onEndPositionMove sets selectedEnd to shift endTime if position is past that', () => {
    const startTime = '2019-11-25T15:00:03.000Z';
    const endTime = '2019-11-26T15:10:00.000Z';
    const demoCurrentShift = {
      startTimeISO: '2019-11-25T15:00:00.000Z',
      endTimeISO: '2019-11-26T15:00:00.000Z',
      id: 1234,
      producedQty: 8423,
    };
    const y = scaleBand().domain([
      '2019-11-25T15:00:00.000Z',
      '2019-11-25T16:00:00.000Z',
      '2019-11-25T17:00:00.000Z',
      '2019-11-25T18:00:00.000Z',
      '2019-11-25T19:00:00.000Z',
      '2019-11-25T20:00:00.000Z',
      '2019-11-25T21:00:00.000Z',
      '2019-11-25T22:00:00.000Z',
      '2019-11-25T23:00:00.000Z',
      '2019-11-26T00:00:00.000Z',
      '2019-11-26T01:00:00.000Z',
      '2019-11-26T02:00:00.000Z',
      '2019-11-26T03:00:00.000Z',
      '2019-11-26T04:00:00.000Z',
      '2019-11-26T05:00:00.000Z',
      '2019-11-26T06:00:00.000Z',
      '2019-11-26T07:00:00.000Z',
      '2019-11-26T08:00:00.000Z',
      '2019-11-26T09:00:00.000Z',
      '2019-11-26T10:00:00.000Z',
      '2019-11-26T11:00:00.000Z',
      '2019-11-26T12:00:00.000Z',
      '2019-11-26T13:00:00.000Z',
      '2019-11-26T14:00:00.000Z',
    ]).range([0, 2400]);
    calculator = new PositionCalculator({
      startTime,
      endTime,
      xStart: 0,
      xEnd: 3600,
      yScale: y,
      selectedRange: [],
      currentShift: demoCurrentShift,
      timezone: 'UTC',
    });
    calculator.onEndPositionMove(3610, 2600);
    expect(calculator.getSelectedRange()[1]).toBe(demoCurrentShift.endTimeISO);
  });
});
