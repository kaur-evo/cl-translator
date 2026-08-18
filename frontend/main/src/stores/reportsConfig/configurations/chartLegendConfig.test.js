import getChartLegendConfig from './chartLegendConfig';

import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

describe('getChartLegendConfig', () => {
  it('returns correct config for CHECKLIST config type and AVG_TIME_VAL yAxis', () => {
    const formattedEntry = { color: 'red' };
    const groupId = 'group1';
    const cfgType = configType.CHECKLIST;
    const requirements = {
      yAxis: yAxisKey.AVG_TIME_VAL,
      translations: { AverageTime: 'Average Time' },
    };

    const result = getChartLegendConfig({
      formattedEntry,
      groupId,
      cfgType,
      requirements,
    });

    expect(result).toEqual({
      color: 'red',
      text: 'Average Time',
    });
  });

  it('returns correct config for non-CHECKLIST config type', () => {
    const formattedEntry = { color: 'blue', entityGroupName: 'Entity Group' };
    const groupId = 'group2';
    const cfgType = 'OTHER_CONFIG_TYPE';
    const requirements = { yAxis: 'OTHER_Y_AXIS' };

    const result = getChartLegendConfig({
      formattedEntry,
      groupId,
      cfgType,
      requirements,
    });

    expect(result).toEqual({
      color: 'blue',
      text: 'Entity Group',
    });
  });

  it('returns groupId as text if entityGroupName is not present', () => {
    const formattedEntry = { color: 'green' };
    const groupId = 'group3';
    const cfgType = 'OTHER_CONFIG_TYPE';
    const requirements = { yAxis: 'OTHER_Y_AXIS' };

    const result = getChartLegendConfig({
      formattedEntry,
      groupId,
      cfgType,
      requirements,
    });

    expect(result).toEqual({
      color: 'green',
      text: 'group3',
    });
  });
});
