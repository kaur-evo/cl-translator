import ShiftviewWidgetChart from './ShiftviewCustomChart';

describe('ShiftviewWidgetChart', () => {
  const widget = new ShiftviewWidgetChart({
    data: [
      {
        measure: new Date('2022-05-05T03:01:00.000Z'), point1: 7, point2: 10, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '10 units',
      },
      {
        measure: new Date('2022-05-05T03:02:00.000Z'), point1: 7, point2: 20, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '20 units',
      },
    ],
    fontSize: 12,
    timeZone: 'UTC',
    widgetConfig: {
      yAxes: ['axisLeft', 'axisRight'],
      yAxisUnit: 'Unit',
      yAxisUnitRight: 'Unit Right',
      dataPoints: ['point1', 'point2'],
      yAxisMin: 0,
      yAxisMax: 100,
      yAxisMinRight: 0,
      yAxisMaxRight: 200,
    },
    timezone: 'UTC',
  });

  test('that constructor creates correct instance', () => {
    expect(widget).toBeInstanceOf(ShiftviewWidgetChart);
    expect(widget.data).toEqual([
      {
        measure: new Date('2022-05-05T03:01:00.000Z'), point1: 7, point2: 10, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '10 units',
      },
      {
        measure: new Date('2022-05-05T03:02:00.000Z'), point1: 7, point2: 20, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '20 units',
      },
    ]);
    expect(widget.fontSize).toBe(12);
    expect(widget.timezone).toBe('UTC');
    expect(widget.colorScale).toBeDefined();
    expect(widget.yAxes).toEqual(['axisLeft', 'axisRight']);
    expect(widget.yAxisLeftLabel).toBe('Unit');
    expect(widget.yAxisRightLabel).toBe('Unit Right');
    expect(widget.dataPoints).toEqual(['point1', 'point2']);
    expect(widget.dataPointObj).toEqual({
      point1: 'axisLeft',
      point2: 'axisRight',
    });
    expect(widget.yAxisMin).toBe(0);
    expect(widget.yAxisMax).toBe(100);
    expect(widget.yAxisMinRight).toBe(0);
    expect(widget.yAxisMaxRight).toBe(200);
    expect(widget.hasRightAxis).toBe(true);
  });

  test('that xDomain returns correct result', () => {
    expect(widget.xDomain[0]).toEqual(new Date('2022-05-05T03:01:00.000Z'));
    expect(widget.xDomain[widget.xDomain.length - 1]).toEqual(new Date('2022-05-05T03:02:00.000Z'));
  });

  test('yDomain', () => {
    expect(widget.yDomain[0]).toEqual(0);
    expect(widget.yDomain[1]).toBeCloseTo(110);
  });

  test('yDomainRight', () => {
    expect(widget.yDomainRight[0]).toEqual(0);
    expect(widget.yDomainRight[1]).toBeCloseTo(220);
  });

  test('that xScale is set correctly', () => {
    expect(widget.xScale).toBeDefined();
    expect(widget.xScale.domain()).toEqual(widget.xDomain);
  });

  test('that yScale is set correctly', () => {
    expect(widget.yScale).toBeDefined();
    expect(widget.yScale.domain()).toEqual(widget.yDomain);
  });

  test('that widget has left, right and bottom axes', () => {
    expect(widget.leftAxis).toBeDefined();
    expect(widget.rightAxis).toBeDefined();
    expect(widget.bottomAxis).toBeDefined();
  });

  test('that widget has datapoint for each line', () => {
    widget.dataPoints.forEach((dataPointKey) => {
      expect(widget[`${dataPointKey}Line`]).toBeDefined();
    });
  });

  test('that axisHoverLine is defined', () => {
    expect(widget.axisHoverLine).toBeDefined();
  });

  test('that tooltipHTMLFunc returns expected snapshot', () => {
    const tooltipHTML = widget.tooltipHTMLFunc()(widget.data);
    expect(tooltipHTML).toMatchSnapshot();
  });

  test('that yDomains returns correct values when max and min are not defined', () => {
    const widgetWithUndefinedMinMax = new ShiftviewWidgetChart({
      data: [
        {
          measure: new Date('2022-05-05T03:01:00.000Z'), point1: 7, point2: 10, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '10 units',
        },
        {
          measure: new Date('2022-05-05T03:02:00.000Z'), point1: 7, point2: 20, measureLabel: '03:01:00', point1Label: '7 unit', point2Label: '20 units',
        },
      ],
      fontSize: 12,
      timeZone: 'UTC',
      widgetConfig: {
        yAxes: ['axisLeft', 'axisRight'],
        yAxisUnit: 'Unit',
        yAxisUnitRight: 'Unit Right',
        dataPoints: ['point1', 'point2'],
      },
      timezone: 'UTC',
    });

    expect(widgetWithUndefinedMinMax.yDomain[0]).toEqual(0);
    expect(widgetWithUndefinedMinMax.yDomain[1]).toBeCloseTo(7.7);
    expect(widgetWithUndefinedMinMax.yDomainRight[0]).toEqual(0);
    expect(widgetWithUndefinedMinMax.yDomainRight[1]).toBeCloseTo(22);
  });

  describe('update', () => {
    it('calls update on each line', () => {
      const updateSpy = vi.spyOn(widget.point1Line, 'update');
      const updateSpy2 = vi.spyOn(widget.point2Line, 'update');
      widget.update();
      expect(updateSpy).toHaveBeenCalledWith(widget.data);
      expect(updateSpy2).toHaveBeenCalledWith(widget.data);
    });
  });
});
