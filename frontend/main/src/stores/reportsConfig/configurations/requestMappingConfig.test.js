import { getRequestMeasures, getRequestDimensions, getTrendlineMeasure } from './requestMappingConfig';

import configType from '@/stores/reportsConfig/constants/configType';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

describe('getRequestMeasures', () => {
  it('returns the correct measures for DOWNTIME config type with STARTTIME granularity', () => {
    const measures = getRequestMeasures({ type: configType.DOWNTIME, granularity: granularityType.STARTTIME, groupBy: ['starttime', 'timelineid'] });

    expect(measures).toEqual([
      measure.NOTES_COUNT,
      measure.STOP_DURATION,
      measure.STOP_COUNT,
    ]);
  });

  it('returns the correct measures for DOWNTIME config type if stop reasons are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.DOWNTIME, granularity: 'total', groupBy: ['entityId'] });

    expect(measures).toEqual([
      measure.STOP_COUNT,
      measure.NOTES_COUNT,
      measure.STOP_PCT,
      measure.STOP_DURATION,
      measure.STOPS_INCLUDED_IN_OEE,
      measure.STOP_TYPE,
      measure.TOTAL_PLANNED_TIME,
      measure.IDEAL_QTY,
      measure.IDEAL_ALT_QTY,

    ]);
  });

  it('returns the correct measures for DOWNTIME config type if stations are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.DOWNTIME, granularity: 'total', groupBy: ['station', 'commentgroup'] });

    expect(measures).toEqual([
      measure.STOP_COUNT,
      measure.NOTES_COUNT,
      measure.STOP_PCT,
      measure.STOP_DURATION,
      measure.STOPS_INCLUDED_IN_OEE,
      measure.STOP_TYPE,
      measure.ROW_PLANNED_TIME,
      measure.IDEAL_QTY,
      measure.IDEAL_ALT_QTY,
    ]);
  });

  it('returns the correct measures for SPEEDLOSS config type with STARTTIME granularity', () => {
    const measures = getRequestMeasures({ type: configType.SPEEDLOSS, granularity: granularityType.STARTTIME, groupBy: [] });

    expect(measures).toEqual([
      measure.PERFORMANCE_LOSS_NOTES_COUNT,
      measure.PERFORMANCE_LOSS_DURATION,
      measure.PERFORMANCE_LOSS_COUNT,
    ]);
  });

  it('returns the correct measures for SPEEDLOSS config type if speed loss reasons are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: ['entityId'] });

    expect(measures).toEqual([
      measure.PERFORMANCE_LOSS_COUNT,
      measure.PERFORMANCE_LOSS_NOTES_COUNT,
      measure.PERFORMANCE_LOSS_PCT,
      measure.PERFORMANCE_LOSS_DURATION,
      measure.IDEAL_QTY,
      measure.IDEAL_ALT_QTY,
      measure.ROW_PRODUCED_QTY,
      measure.ROW_PRODUCED_ALT_QTY,
    ]);
  });

  it('returns the correct measures for SPEEDLOSS config type if stations are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: ['station', 'commentgroup'] });

    expect(measures).toEqual([
      measure.PERFORMANCE_LOSS_COUNT,
      measure.PERFORMANCE_LOSS_NOTES_COUNT,
      measure.PERFORMANCE_LOSS_PCT,
      measure.PERFORMANCE_LOSS_DURATION,
      measure.IDEAL_QTY,
      measure.IDEAL_ALT_QTY,
      measure.ROW_PRODUCED_QTY,
      measure.ROW_PRODUCED_ALT_QTY,
    ]);
  });

  it('returns the correct measures for SCRAPREASON config type with STARTTIME granularity', () => {
    const measures = getRequestMeasures({ type: configType.SCRAPREASON, granularity: granularityType.STARTTIME, groupBy: [] });

    expect(measures).toEqual([]);
  });

  it('returns the correct measures for SCRAPREASON config type if scrap reasons are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.SCRAPREASON, granularity: 'total', groupBy: ['entityId'] });

    expect(measures).toEqual([
      measure.SCRAP_QTY,
      measure.SCRAP_ALT_QTY,
      measure.TOTAL_PRODUCED_QTY,
      measure.TOTAL_PRODUCED_ALT_QTY,
      measure.GOOD_PRODUCTION,
      measure.SCRAP_DURATION,
      measure.TOTAL_PLANNED_TIME,
    ]);
  });

  it('returns the correct measures for SCRAPREASON config type if stations are on x-axis', () => {
    const measures = getRequestMeasures({ type: configType.SCRAPREASON, granularity: 'total', groupBy: ['station', 'commentgroup'] });

    expect(measures).toEqual([
      measure.SCRAP_QTY,
      measure.SCRAP_ALT_QTY,
      measure.ROW_PRODUCED_QTY,
      measure.ROW_PRODUCED_ALT_QTY,
      measure.GOOD_PRODUCTION,
      measure.SCRAP_DURATION,
      measure.ROW_PLANNED_TIME,
    ]);
  });

  it('returns the correct measures for OEE config type', () => {
    const measures = getRequestMeasures({ type: configType.OEE });

    expect(measures).toEqual([
      measure.PLANNED_TIME,
      measure.ROW_PRODUCED_QTY,
      measure.ROW_PRODUCED_ALT_QTY,
      measure.TECHNICAL_AVAILABILITY,
      measure.AVAILABILITY,
      measure.PERFORMANCE,
      measure.QUALITY,
      measure.OEE,
      measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
    ]);
  });

  it('returns the correct measures for QUANTITY config type', () => {
    const measures = getRequestMeasures({ type: configType.QUANTITY });

    expect(measures).toEqual([
      measure.ROW_PRODUCED_QTY,
      measure.ROW_PRODUCED_ALT_QTY,
      measure.SCRAP_QTY,
      measure.SCRAP_ALT_QTY,
      measure.IDEAL_QTY,
      measure.IDEAL_ALT_QTY,
      measure.GOOD_QTY,
      measure.GOOD_ALT_QTY,
      measure.IDEAL_PERFORMANCE_QTY,
      measure.IDEAL_PERFORMANCE_ALT_QTY,
      measure.AVAILABILITY,
      measure.PLANNED_TIME,
    ]);
  });

  it('returns the correct measures for TIME_USAGE config type', () => {
    const measures = getRequestMeasures({ type: configType.TIME_USAGE });

    expect(measures).toEqual([
      measure.PLANNED_TIME,
      measure.GOOD_PRODUCTION,
      measure.SLOW_PRODUCTION,
      measure.STOPS,
      measure.UNPLANNED_STOP,
      measure.PLANNED_STOP,
      measure.UNCOMMENTED_STOP,
      measure.PLANNED_STOP_INCLUDED_IN_OEE,
      measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
    ]);
  });

  it('returns the correct measures for CHECKLIST config type', () => {
    const measures = getRequestMeasures({ type: configType.CHECKLIST });

    expect(measures).toEqual([
      measure.CHECKLIST_MISSED_COUNT,
      measure.CHECKLIST_SUCCESSFUL_COUNT,
      measure.CHECKLIST_UNSUCCESSFUL_COUNT,
      measure.CHECKLIST_TOTAL_COUNT,
      measure.CHEKLIST_MISSING_DURATION,
      measure.CHEKLIST_SUCCESSFUL_DURATION,
      measure.CHEKLIST_UNSUCCESSFUL_DURATION,
      measure.NOTES_COUNT,
      measure.MEDIAN_CHECK_DURATION,
    ]);
  });

  it('returns an empty array for unknown config type', () => {
    const measures = getRequestMeasures({ type: 'unknown' });

    expect(measures).toEqual([]);
  });
});

describe('getTrendlineMeasure', () => {
  it('returns correct measure for DOWNTIME config type', () => {
    expect(getTrendlineMeasure({ type: configType.DOWNTIME, yAxis: yAxisKey.VALUE })).toEqual(measure.STOP_DURATION);
    expect(getTrendlineMeasure({ type: configType.DOWNTIME, yAxis: yAxisKey.ENTITY_COUNT })).toEqual(measure.STOP_COUNT);
    expect(getTrendlineMeasure({ type: configType.DOWNTIME, yAxis: yAxisKey.NOTES_COUNT })).toEqual(measure.NOTES_COUNT);
    expect(getTrendlineMeasure({ type: configType.DOWNTIME, yAxis: 'unknown' })).toEqual(null);
  });

  it('returns correct measure for SPEEDLOSS config type', () => {
    expect(getTrendlineMeasure({ type: configType.SPEEDLOSS, yAxis: yAxisKey.VALUE })).toEqual(measure.PERFORMANCE_LOSS_DURATION);
    expect(getTrendlineMeasure({ type: configType.SPEEDLOSS, yAxis: yAxisKey.ENTITY_COUNT })).toEqual(measure.PERFORMANCE_LOSS_COUNT);
    expect(getTrendlineMeasure({ type: configType.SPEEDLOSS, yAxis: yAxisKey.NOTES_COUNT })).toEqual(measure.PERFORMANCE_LOSS_NOTES_COUNT);
    expect(getTrendlineMeasure({ type: configType.SPEEDLOSS, yAxis: 'unknown' })).toEqual(null);
  });

  it('returns correct measure for SCRAPREASON config type', () => {
    expect(getTrendlineMeasure({ type: configType.SCRAPREASON, yAxis: yAxisKey.ENTITY_COUNT })).toEqual(measure.SCRAP_QTY);
    expect(getTrendlineMeasure({ type: configType.SCRAPREASON, yAxis: yAxisKey.ENTITY_ALT_COUNT })).toEqual(measure.SCRAP_ALT_QTY);
    expect(getTrendlineMeasure({ type: configType.SCRAPREASON, yAxis: 'unknown' })).toEqual(null);
  });

  it('returns correct measure for OEE config type', () => {
    expect(getTrendlineMeasure({ type: configType.OEE, yAxis: yAxisKey.VALUE })).toEqual(measure.OEE);
    expect(getTrendlineMeasure({ type: configType.OEE, yAxis: 'unknown' })).toEqual(null);
  });
});

describe('getRequestDimensions', () => {
  it('returns the correct dimensions for DOWNTIME config type with STARTTIME granularity', () => {
    const dimensions = getRequestDimensions({ type: configType.DOWNTIME, granularity: granularityType.STARTTIME });

    expect(dimensions).toEqual([
      dimension.COMMENT,
      dimension.COMMENT_GROUP,
      dimension.STOP_LOCATION,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.TIMELINE_ID,
      dimension.STARTTIME,
    ]);
  });

  it('returns the correct dimensions for DOWNTIME config type with other granularities', () => {
    const dimensions = getRequestDimensions({ type: configType.DOWNTIME, granularity: 'other' });

    expect(dimensions).toEqual([
      dimension.COMMENT,
      dimension.COMMENT_GROUP,
      dimension.STOP_LOCATION,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
    ]);
  });

  it('returns the correct dimensions for SPEEDLOSS config type with STARTTIME granularity', () => {
    const dimensions = getRequestDimensions({ type: configType.SPEEDLOSS, granularity: granularityType.STARTTIME });

    expect(dimensions).toEqual([
      dimension.PERFORMANCE_COMMENT,
      dimension.PERFORMANCE_COMMENT_GROUP,
      dimension.PERFORMANCE_LOSS_LOCATION,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.PERFORMANCE_LOSS_INSTANCE_ID,
      granularityType.DATE,
    ]);
  });

  it('returns the correct dimensions for SPEEDLOSS config type with other granularities', () => {
    const dimensions = getRequestDimensions({ type: configType.SPEEDLOSS, granularity: 'other' });

    expect(dimensions).toEqual([
      dimension.PERFORMANCE_COMMENT,
      dimension.PERFORMANCE_COMMENT_GROUP,
      dimension.PERFORMANCE_LOSS_LOCATION,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
    ]);
  });

  it('returns the correct dimensions for SCRAPREASON config type', () => {
    const dimensions = getRequestDimensions({ type: configType.SCRAPREASON });

    expect(dimensions).toEqual([
      dimension.SCRAP_REASON,
      dimension.SCRAP_REASON_GROUP,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
    ]);
  });

  it('returns the correct dimensions for OEE config type', () => {
    const dimensions = getRequestDimensions({ type: configType.OEE });

    expect(dimensions).toEqual([
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.SHIFT_TEMPLATE,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
    ]);
  });

  it('returns the correct dimensions for QUANTITY config type', () => {
    const dimensions = getRequestDimensions({ type: configType.QUANTITY });

    expect(dimensions).toEqual([
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.SHIFT_TEMPLATE,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
    ]);
  });

  it('returns the correct dimensions for TIME_USAGE config type', () => {
    const dimensions = getRequestDimensions({ type: configType.TIME_USAGE });

    expect(dimensions).toEqual([
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.SHIFT_TEMPLATE,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
    ]);
  });

  it('returns the correct dimensions for CHECKLIST config type', () => {
    const dimensions = getRequestDimensions({ type: configType.CHECKLIST });

    expect(dimensions).toEqual([
      dimension.CHECKLIST,
      dimension.CHECKLIST_GROUP,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.OPERATOR,
      dimension.SHIFT_TEMPLATE,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.CHECKLIST_PIN,
      dimension.CHECKLIST_DONE_BY,

    ]);
  });

  it('returns the correct dimensions for groupBy singleOperator', () => {
    const dimensions = getRequestDimensions({ type: configType.DOWNTIME, groupBy: ['singleOperator'] });

    expect(dimensions).toEqual([
      dimension.COMMENT,
      dimension.COMMENT_GROUP,
      dimension.STOP_LOCATION,
      dimension.FACTORY,
      dimension.STATION,
      dimension.STATION_GROUP,
      dimension.SHIFT_TEMPLATE,
      dimension.PRODUCT,
      dimension.PRODUCT_GROUP,
      dimension.LOT_CODE,
      dimension.PRODUCTION_ORDER,
      dimension.OPERATOR,
      dimension.SINGLE_OPERATOR,
    ]);
  });

  it('returns an empty array for unknown config type', () => {
    const dimensions = getRequestDimensions({ type: 'unknown' });

    expect(dimensions).toEqual([]);
  });
});
