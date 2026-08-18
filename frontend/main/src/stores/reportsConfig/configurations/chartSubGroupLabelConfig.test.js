import getChartSubGroupLabelConfig from './chartSubGroupLabelConfig';

import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

describe('getChartSubGroupLabelConfig', () => {
  it('returns null when isCompact is true', () => {
    const result = getChartSubGroupLabelConfig({ cfgType: configType.CHECKLIST, yAxis: yAxisKey.ENTITY_COUNT, isCompact: true });
    expect(result).toBe(null);
  });

  it('returns "entityCountPctFormatted-0" for CHECKLIST config type and ENTITY_COUNT_PCT yAxis if bar width is less than 55', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.CHECKLIST, yAxis: yAxisKey.ENTITY_COUNT_PCT, isCompact: false, barWidth: 54,
    });
    expect(result).toBe('entityCountPctFormatted-0');
  });

  it('returns "entityCountPctFormatted-1" for CHECKLIST config type and ENTITY_COUNT_PCT yAxis if bar width is from 55 to 65', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.CHECKLIST, yAxis: yAxisKey.ENTITY_COUNT_PCT, isCompact: false, barWidth: 60,
    });
    expect(result).toBe('entityCountPctFormatted-1');
  });

  it('returns "entityCountPctFormatted-2" for CHECKLIST config type and ENTITY_COUNT_PCT yAxis if bar width is more than 65', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.CHECKLIST, yAxis: yAxisKey.ENTITY_COUNT_PCT, isCompact: false, barWidth: 70,
    });
    expect(result).toBe('entityCountPctFormatted-2');
  });

  it('returns "entityCount" for CHECKLIST config type and ENTITY_COUNT yAxis', () => {
    const result = getChartSubGroupLabelConfig({ cfgType: configType.CHECKLIST, yAxis: yAxisKey.ENTITY_COUNT, isCompact: false });
    expect(result).toBe('entityCount');
  });

  it('returns "valueFormatted-0" for TIME_USAGE config type if barWidth is less than 55 and VALUE is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.VALUE, isCompact: false, barWidth: 54,
    });
    expect(result).toBe('valueFormatted-0');
  });

  it('returns "valueFormatted-1" for TIME_USAGE config type if barWidth is from 55 to 65 and VALUE is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.VALUE, isCompact: false, barWidth: 60,
    });
    expect(result).toBe('valueFormatted-1');
  });

  it('returns "valueFormatted-2" for TIME_USAGE config type if barWidth is more than 65 and VALUE is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.VALUE, isCompact: false, barWidth: 70,
    });
    expect(result).toBe('valueFormatted-2');
  });

  it('returns "pctOfPlannedTimeFormatted-0" for TIME_USAGE config type if barWidth is less than 55 and PCT_OF_PLANNED_TIME is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.PCT_OF_PLANNED_TIME, isCompact: false, barWidth: 54,
    });
    expect(result).toBe('pctOfPlannedTimeFormatted-0');
  });

  it('returns "pctOfPlannedTimeFormatted-1" for TIME_USAGE config type if barWidth is from 55 to 65 and PCT_OF_PLANNED_TIME is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.PCT_OF_PLANNED_TIME, isCompact: false, barWidth: 60,
    });
    expect(result).toBe('pctOfPlannedTimeFormatted-1');
  });

  it('returns "pctOfPlannedTimeFormatted-2" for TIME_USAGE config type if barWidth is more than 65 and PCT_OF_PLANNED_TIME is on y axis', () => {
    const result = getChartSubGroupLabelConfig({
      cfgType: configType.TIME_USAGE, yAxis: yAxisKey.PCT_OF_PLANNED_TIME, isCompact: false, barWidth: 70,
    });
    expect(result).toBe('pctOfPlannedTimeFormatted-2');
  });

  it('returns "durationFormatted" for TIME_USAGE config type if yAxis is duration', () => {
    const result = getChartSubGroupLabelConfig({ cfgType: configType.TIME_USAGE, yAxis: yAxisKey.DURATION, isCompact: false });
    expect(result).toBe('durationFormatted');
  });

  it('returns null for unknown config type', () => {
    const result = getChartSubGroupLabelConfig({ cfgType: 'UNKNOWN', yAxis: yAxisKey.ENTITY_COUNT, isCompact: false });
    expect(result).toBe(null);
  });
});
