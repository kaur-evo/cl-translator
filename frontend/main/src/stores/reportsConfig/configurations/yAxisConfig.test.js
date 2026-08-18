import getYAxisConfig from './yAxisConfig';

import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

const yAxisVariations = [
  yAxisKey.ENTITY_COUNT, // numeric
  yAxisKey.AVG_DURATION_VAL, // time
  yAxisKey.AVG_TIME_VAL, // time
  yAxisKey.ENTITY_PCT_PLANNED_TIME, // percentage
  yAxisKey.VALUE, // value
  yAxisKey.DURATION, // duration
  yAxisKey.PRODUCTION_COUNT, // numeric
  yAxisKey.PRODUCTION_TIME, // time
  'something else', // something else
];

describe('yAxisConfig', () => {
  Object.values(configType).forEach((type) => {
    describe(`for configuration type ${type}`, () => {
      yAxisVariations.forEach((yAxis) => {
        describe(`for yAxis ${yAxis}`, () => {
          it('returns expected configuration snapshot', () => {
            let config = 'case not defined';
            try {
              config = getYAxisConfig({ type, locale: 'en', yAxis });
            } catch {
              // pass # throws error for missing configuration
            }
            expect(config).toMatchSnapshot();
          });
        });
      });
    });
  });
});
