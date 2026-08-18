import getHelperFunctions from './columnHelperFunctions';

describe('columnHelperFunctions', () => {
  describe('getPlannedTimeAppendText', () => {
    it('returns "Total" when shouldUseTotalMeasures is true', () => {
      const options = {
        granularity: 'total',
        groupBy: ['entityId'],
        configType: 'DOWNTIME',
      };
      const result = getHelperFunctions(options).getPlannedTimeAppendText();
      expect(result).toBe('(Total)');
    });

    it('returns the entity label when granularity is total', () => {
      const options = {
        granularity: 'total',
        groupBy: ['stationId'],
        configType: 'DOWNTIME',
      };
      const result = getHelperFunctions(options).getPlannedTimeAppendText();
      expect(result).toBe('(station)');
    });

    it('returns the long date time field when granularity is not total', () => {
      const options = {
        granularity: 'day',
        groupBy: ['day', 'commentgroup'],
        configType: 'DOWNTIME',
      };
      const result = getHelperFunctions(options).getPlannedTimeAppendText();
      expect(result).toBe('(Day)');
    });

    it('returns empty string when granularity is starttime', () => {
      const options = {
        granularity: 'starttime',
        groupBy: ['starttime', 'commentgroup'],
        configType: 'DOWNTIME',
      };
      const result = getHelperFunctions(options).getPlannedTimeAppendText();
      expect(result).toBe('');
    });
  });
});
