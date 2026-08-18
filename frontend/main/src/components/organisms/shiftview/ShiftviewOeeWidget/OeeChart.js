import { DateTime } from 'luxon';
import * as d3 from 'd3';
import { mdiCircleMedium } from '@mdi/js';

import mixin from '@/helpers/class/mixin';
import BaseContainer from '@/d3/BaseContainer';
import ZoomModule from '@/d3/Zoom';
import LineChartModule from '@/d3/LineChart';
import AreaChartModule from '@/d3/AreaChart';
import XAxisHoverLineModule from '@/d3/XAxisHoverLine';
import BottomAxisModule from '@/d3/BottomAxis';
import AreaHighlightModule from '@/d3/AreaHighlight';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import VerticalBarChartModule from '@/d3/VerticalBarChart';
import i18n from '@/services/i18n';
import { getTextWidth, hideTooltip, showTooltip } from '@/helpers/d3Helpers';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';
import { MARGIN_PTC, OFFSET_MULTIPLIER } from '@/d3/constants';

const colors = colorConstants.dark;
export default class ShiftviewWidgetChart
  extends mixin(BaseContainer).with(
    AreaChartModule,
    LineChartModule,
    XAxisHoverLineModule,
    ZoomModule,
    BottomAxisModule,
    AreaHighlightModule,
    VerticalAxisModule,
    GridlinesModule,
    VerticalBarChartModule,
  ) {
  constructor(opts) {
    super(opts);
    this.data = opts.data;
    this.xDomainOpt = opts.xDomainOpt;
    this.dataType = opts.dataType;
    this.translations = opts.translations;
    this.fontSize = opts.fontSize;
    this.xAxisLabel = opts.xAxisLabel;
    this.widgetConfig = opts.widgetConfig || {};
    this.timezone = opts.timezone;
    this.widgetConfig = Object.assign(
      this.widgetConfig,
      {
        dataPoints: ['target', 'quality', 'performance', 'availability'],
        lineDefinitions: [
          {
            color: 'white',
            hiddenInTooltip: true,
          },
          {
            label: this.translations.Quality,
            color: colors.secondary,
          },
          {
            label: this.translations.Performance,
            color: colors['lw-yellow'],
          },
          {
            label: this.translations.Availability,
            color: colors.primary,
          },

        ],
      },
    );

    this.xAxisLabel = (opts.widgetConfig?.yAxisUnit) || '';
    this.draw();
  }

  get xAxisLabelPx() {
    const textLengthMultiplier = 1.3;
    const textMarginPx = 7;
    return (getTextWidth(this.xAxisLabel) * textLengthMultiplier) + textMarginPx;
  }

  // override
  get xDomain() {
    if (this.xDomainOpt?.length) {
      return this.xDomainOpt;
    }
    return this.xDomainData.map((d) => d.measure);
  }

  // override

  get yDomain() {
    const defaultMax = 1.1;
    const performaneValues = this.data.map((d) => d.performance);
    const max = Math.max(...performaneValues, defaultMax);
    return [0, max];
  }

  setXScale() {
    this.xScale = d3.scaleBand()
      .range([0, this.width])
      .domain(this.xDomain)
      // eslint-disable-next-line no-magic-numbers
      .padding(0.6);
  }

  update() {
    if (this.data) {
      this.xScale.domain(this.xDomain);
      this.bottomAxis.update();
      this.yScale.domain(this.yDomain);
      this.leftAxis.update();
      this.gridlinesContainer.call((g) => this.updateGridlines(g));
      this.widgetConfig.dataPoints.forEach((dataPointKey) => {
        this[`${dataPointKey}LineChart`].update(this.data);
      });
      this.axisHoverLine.update(this.widgetConfig.dataPoints.map(() => this.data));
      this.verticalBarChart.update(this.data);
    }
  }

  getColor(index) {
    if (this.widgetConfig.lineDefinitions?.[index]?.color) {
      return this.widgetConfig.lineDefinitions[index].color;
    }
    return this.colorScale(index);
  }

  draw() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    const { data } = this;
    const right = this.element ? this.element.clientWidth * MARGIN_PTC : 0;
    this.margin = {
      top: 10,
      right,
      bottom: 0,
      left: 0,
    };

    this.drawSVGContainer(this.margin);
    this.leftAxis = this.createVerticalAxis({ ticksCount: 4 });
    this.bottomAxis = this.createBottomAxis({
      data: this.xDomain,
      scaleType: 'scaleBand',
      labelKey: 'measure',
      axisValueKey: null,
      fontSize: this.fontSize,
      tickFormat: (tick) => DateTime.fromISO(tick, { zone: this.timezone }).toFormat('HH'),
    });
    this.setXScale();
    this.bottomAxis.draw();
    this.max = d3.max(this.data, (d) => Math.max(d[this.widgetConfig.dataPoints[0]] * OFFSET_MULTIPLIER, d[this.widgetConfig.targetKey] * OFFSET_MULTIPLIER));
    this.setYScale();
    this.leftAxis.precalculate();
    this.leftAxis.draw();
    // Re-apply range after leftAxis.precalculate() finalizes marginLeft
    this.xScale.range([0, this.width]);
    this.gridlines = this.drawGridlines(this.svg, {
      strokeDashArray: '0',
      ticksCount: 4,
    });

    this.drawPlot(this.margin);
    this.verticalBarChart = this.drawVerticalBarChart(data, { yKey: 'oee', hoverEnabled: false });

    this.widgetConfig.dataPoints.forEach((dataPointKey, index) => {
      this[`${dataPointKey}LineChart`] = this.drawLineChart(
        data,
        {
          color: this.getColor(index),
          yKey: dataPointKey,
          xScaleBandOffset: true,
        },
      );
    });

    this.axisHoverLine = this.drawXAxisHoverLine(
      this.widgetConfig.dataPoints.map(() => data),
      {
        circleColors: this.widgetConfig.dataPoints.map((key, index) => () => this.getColor(index)),
        circleFillColors: this.widgetConfig.dataPoints.map(() => colors.black),
        color: colors.white,
        yKey: this.widgetConfig.dataPoints,
        xKey: 'measure',
        strokeWidth: '1px',
        scaleType: 'scaleBand',
        bisect: 'center',
        xScaleBandOffset: true,
        strokeDash: 0,
      },
    );
    this.axisHoverLine.onMouseMove = (ev, d) => {
      showTooltip({
        params: {
          ...d,
          tooltipHTMLFunc: this.tooltipHTMLFunc(),
        },
      });
    };
    this.axisHoverLine.onMouseOut = () => {
      hideTooltip();
    };
  }

  getMeasureLabel(key, i) {
    if (this.widgetConfig?.lineDefinitions?.[i]?.label !== undefined) {
      return this.widgetConfig.lineDefinitions[i].label;
    }
    return key;
  }

  tooltipHTMLFunc() {
    const vm = this;

    const getTooltipRow = (iconColor, label, dataPointKey, dataset) => {
      const icon = vIconRawTemplate(mdiCircleMedium, 24, iconColor);
      const target = dataPointKey === 'oee' ? this.data[0].target : null;
      const targetString = target ? ` (${i18n.global.t('Target').toLowerCase()} ${formatPercentage(target)})` : '';

      return `<div class="row d-flex pa-0 ma-0 align-center text-label-small font-weight-regular">
              <span class="ml-n2 my-n3 pt-1">${icon}</span>
              <span class="text-tertiary-dark font-weight-medium">${label}:</span>&nbsp;
              <span class="text-body-small">${formatPercentage(dataset[dataPointKey] * 100)} ${targetString}</span>
            </div>`;
    };

    return (dataSets) => {
      const d = dataSets[0];
      if (d?.measure) {
        const headerRow = `<div class="row align-center mb-1 text-body-large">${d.startTime} - ${d.endTime}</div>`;
        const dataRows = [getTooltipRow(graphColors['above-target-oee'], this.translations.OEE, 'oee', d)];
        vm.widgetConfig.dataPoints.forEach((dataPointKey, i) => {
          if (vm.widgetConfig.lineDefinitions[i].hiddenInTooltip) return;
          const row = getTooltipRow(vm.getColor(i), vm.getMeasureLabel(dataPointKey, i), dataPointKey, d);
          dataRows.push(row);
        });

        return `<div class="row align-center text-white"><v-col>
            ${headerRow}
            ${dataRows.join('')}
        </v-col></div>`;
      }
      return '';
    };
  }
}
