import yAxisOptions from './yAxisSelectionMenuItems';

import configType from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

describe('yAxisOptions', () => {
  it('returns the correct options for DOWNTIME config type', () => {
    const options = yAxisOptions({ type: configType.DOWNTIME, isSecondYAxis: false });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(5);

    expect(options.get(yAxisKey.VALUE)).toEqual({ label: i18n.global.t('Duration') });
    expect(options.get(yAxisKey.ENTITY_COUNT)).toEqual({ label: i18n.global.t('stopcount') });
    expect(options.get(yAxisKey.NOTES_COUNT)).toEqual({ label: i18n.global.t('notescount') });
    expect(options.get(yAxisKey.AVG_DURATION_VAL)).toEqual({ label: i18n.global.t('Average duration') });
    expect(options.get(yAxisKey.ENTITY_PCT_PLANNED_TIME)).toEqual({ label: i18n.global.t('% of planned time') });
  });

  it('returns the correct options for SPEEDLOSS config type', () => {
    const options = yAxisOptions({ type: configType.SPEEDLOSS, isSecondYAxis: false });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(4);

    expect(options.get(yAxisKey.VALUE)).toEqual({ label: i18n.global.t('Duration') });
    expect(options.get(yAxisKey.ENTITY_COUNT)).toEqual({ label: i18n.global.t('stopcount') });
    expect(options.get(yAxisKey.NOTES_COUNT)).toEqual({ label: i18n.global.t('notescount') });
    expect(options.get(yAxisKey.AVG_DURATION_VAL)).toEqual({ label: i18n.global.t('Average duration') });
  });

  it('returns the correct options for SPEEDLOSS config type for sexond y-axis', () => {
    const options = yAxisOptions({ type: configType.SPEEDLOSS, isSecondYAxis: true });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(5);

    expect(options.get(yAxisKey.VALUE)).toEqual({ label: i18n.global.t('Duration') });
    expect(options.get(yAxisKey.ENTITY_COUNT)).toEqual({ label: i18n.global.t('stopcount') });
    expect(options.get(yAxisKey.NOTES_COUNT)).toEqual({ label: i18n.global.t('notescount') });
    expect(options.get(yAxisKey.AVG_DURATION_VAL)).toEqual({ label: i18n.global.t('Average duration') });
    expect(options.get('')).toEqual({ label: '-' });
  });

  it('returns the correct options for SCRAPREASON config type', () => {
    const options = yAxisOptions({ type: configType.SCRAPREASON, isSecondYAxis: true });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(4);

    expect(options.get(yAxisKey.SCRAP_QTY_PCT)).toEqual({ label: '% of produced (primary unit)' });
    expect(options.get(yAxisKey.ENTITY_PCT_PLANNED_TIME)).toEqual({ label: i18n.global.t('% of planned time') });
    expect(options.get('')).toEqual({ label: '-' });
  });

  it('returns the correct options for CHECKLIST config type', () => {
    const options = yAxisOptions({ type: configType.CHECKLIST, isSecondYAxis: false });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(3);

    expect(options.get(yAxisKey.ENTITY_COUNT)).toEqual({ label: i18n.global.t('Count') });
    expect(options.get(yAxisKey.ENTITY_COUNT_PCT)).toEqual({ label: i18n.global.t('Percent') });
    expect(options.get(yAxisKey.AVG_TIME_VAL)).toEqual({ label: i18n.global.t('Average time') });
  });

  it('returns the correct options for CHECKLIST config type for secondary axis', () => {
    const options = yAxisOptions({ type: configType.CHECKLIST, isSecondYAxis: true });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(1);

    expect(options.get('')).toEqual({ label: '-' });
  });

  it('returns the correct options for TIME_USAGE config type', () => {
    const options = yAxisOptions({ type: configType.TIME_USAGE, isSecondYAxis: false });

    const expectedOptions = new Map([
      [yAxisKey.VALUE, { label: `${i18n.global.t('Percent')} (${i18n.global.t('Shift time')})` }],
      [yAxisKey.PCT_OF_PLANNED_TIME, { label: `${i18n.global.t('Percent')} (${i18n.global.t('plannedTime')})` }],
      [yAxisKey.DURATION, { label: i18n.global.t('Duration') }],
    ]);

    expect(options).toEqual(expectedOptions);
  });

  it('returns the correct options for TIME_USAGE config type for secondary axis', () => {
    const options = yAxisOptions({ type: configType.TIME_USAGE, isSecondYAxis: true });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(1);

    expect(options.get('')).toEqual({ label: '-' });
  });

  it('returns an empty map for unknown config type', () => {
    const options = yAxisOptions({ type: 'unknown', isSecondYAxis: false });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(0);
  });

  it('returns the correct options for second axis for DOWNTIME config type', () => {
    const options = yAxisOptions({ type: configType.DOWNTIME, isSecondYAxis: true });

    expect(options).toBeInstanceOf(Map);
    expect(options.size).toBe(5);

    expect(options.get(yAxisKey.VALUE)).toEqual({ label: i18n.global.t('Duration') });
    expect(options.get(yAxisKey.ENTITY_COUNT)).toEqual({ label: i18n.global.t('stopcount') });
    expect(options.get(yAxisKey.NOTES_COUNT)).toEqual({ label: i18n.global.t('notescount') });
    expect(options.get(yAxisKey.AVG_DURATION_VAL)).toEqual({ label: i18n.global.t('Average duration') });
    expect(options.get('')).toEqual({ label: '-' });
  });
});
