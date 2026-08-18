import shouldUseTotalMeasures from './shouldUseTotalMeasures';

import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import granularityType from '@/stores/reportsConfig/constants/granularity';

describe('shouldUseTotalMeasures', () => {
  it('returns true if groupBy is entityId and granularity is total', () => {
    expect(shouldUseTotalMeasures(granularityType.TOTAL, xAxisKey.ENTITY_ID)).toBe(true);
  });

  it('returns true if groupBy is entityGroupId and granularity is total', () => {
    expect(shouldUseTotalMeasures(granularityType.TOTAL, xAxisKey.ENTITY_GROUP_ID)).toBe(true);
  });

  it('returns true if groupBy is positionId and granularity is total', () => {
    expect(shouldUseTotalMeasures(granularityType.TOTAL, xAxisKey.POSITION_ID)).toBe(true);
  });

  it('returns true if groupBy is performancePositionId and granularity is total', () => {
    expect(shouldUseTotalMeasures(granularityType.TOTAL, xAxisKey.PERFORMANCE_POSITION_ID)).toBe(true);
  });

  it('returns false if groupBy is stationId and granularity is total', () => {
    expect(shouldUseTotalMeasures(granularityType.TOTAL, xAxisKey.STATION_ID)).toBe(false);
  });
});
