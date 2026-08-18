import ReportsDataMap from './ReportsDataMap';

import granularity from '@/stores/reportsConfig/constants/granularity';

describe('ReportsDataMap', () => {
  let reportsDataMap;

  beforeEach(() => {
    reportsDataMap = new ReportsDataMap({ currentGroupByKey: 'stationId', primaryGroupByKey: 'stationId' });
    reportsDataMap.formattingOptions = {
      timeFormat: { short: 'HH:mm' },
      dateFormat: { short: 'MM/dd/yyyy', long: 'MMMM dd, yyyy' },
    };
    reportsDataMap.translations = { Week: 'Week' };
    reportsDataMap.startDate = new Date(2023, 0, 1);
    reportsDataMap.endDate = new Date(2023, 11, 31);
    reportsDataMap.groupBy = ['stationId'];
  });

  it('should return the correct xScaleTooltipFormat', () => {
    const tooltipFormat = reportsDataMap.xScaleTooltipFormat;
    expect(tooltipFormat.starttime).toBe('HH:mm MMMM dd, yyyy');
    expect(tooltipFormat.month).toBe('formatDateAsMonthRange');
  });

  it('should return the correct xScaleLabelFormat', () => {
    const labelFormat = reportsDataMap.xScaleLabelFormat;
    expect(labelFormat.starttime).toBe('HH:mm');
    expect(labelFormat.month).toBe('MMMM');
  });

  it('should return the correct xScaleTableLabelFormat', () => {
    const tableLabelFormat = reportsDataMap.xScaleTableLabelFormat;
    expect(tableLabelFormat.starttime).toBe('MM/dd/yyyy HH:mm');
    expect(tableLabelFormat.month).toBe('MMMM');
  });

  it('should return the correct xScaleValueKey', () => {
    reportsDataMap.granularity = granularity.TOTAL;
    expect(reportsDataMap.xScaleValueKey).toBe('stationId');

    reportsDataMap.granularity = granularity.MONTH;
    expect(reportsDataMap.xScaleValueKey).toBe(granularity.MONTH);
  });

  it('should return the correct xScaleValueLabelKey', () => {
    reportsDataMap.granularity = granularity.TOTAL;
    expect(reportsDataMap.xScaleValueLabelKey).toBe('station');

    reportsDataMap.granularity = granularity.MONTH;
    expect(reportsDataMap.xScaleValueLabelKey).toBe(granularity.MONTH);
  });

  it('should return the correct entityNameKey', () => {
    expect(reportsDataMap.entityNameKey).toBe('station');
  });

  it('should return the correct itemGroupingIdKey', () => {
    expect(reportsDataMap.itemGroupingIdKey).toBe('stationId');
  });

  it('should return the correct remappedGroupBy', () => {
    expect(reportsDataMap.remappedGroupBy).toBe('stationId');
  });
  describe('getAppendableUnitId', () => {
    it('getAppendableUnitId returns correct string when unitId has one element', () => {
      const obj = { unitId: new Set(['kg']) };
      expect(ReportsDataMap.getAppendableUnitId(obj)).toBe(' kg');
    });

    it('getAppendableUnitId returns empty string when unitId has more than one element', () => {
      const obj = { unitId: new Set(['kg', 'g']) };
      expect(ReportsDataMap.getAppendableUnitId(obj)).toBe('');
    });

    it('getAppendableUnitId returns empty string when unitId is undefined', () => {
      const obj = {};
      expect(ReportsDataMap.getAppendableUnitId(obj)).toBe('');
    });

    it('getAppendableUnitId returns empty string when unitId is empty set', () => {
      const obj = { unitId: new Set() };
      expect(ReportsDataMap.getAppendableUnitId(obj)).toBe('');
    });
  });
  describe('getAppendableAltUnitId', () => {
    it('returns correct string when alternativeUnitId has one element', () => {
      const obj = { alternativeUnitId: new Set(['L']) };
      expect(ReportsDataMap.getAppendableAltUnitId(obj)).toBe(' L');
    });

    it('returns empty string when alternativeUnitId has more than one element', () => {
      const obj = { alternativeUnitId: new Set(['L', 'ml']) };
      expect(ReportsDataMap.getAppendableAltUnitId(obj)).toBe('');
    });

    it('returns empty string when alternativeUnitId is undefined', () => {
      const obj = {};
      expect(ReportsDataMap.getAppendableAltUnitId(obj)).toBe('');
    });

    it('returns empty string when alternativeUnitId is empty set', () => {
      const obj = { alternativeUnitId: new Set() };
      expect(ReportsDataMap.getAppendableAltUnitId(obj)).toBe('');
    });
  });
});
