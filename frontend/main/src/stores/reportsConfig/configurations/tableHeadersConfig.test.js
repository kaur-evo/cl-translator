import getTableHeadersConfig from './tableHeadersConfig';

import configType from '@/stores/reportsConfig/constants/configType';

const types = Object.keys(configType);

describe('getTableHeadersConfig', () => {
  types.forEach((type) => {
    it(`returns correct snapshot for type ${type}`, () => {
      expect(getTableHeadersConfig({
        configType: type, durFormatType: 'SECOND', granularity: 'total', groupBy: ['entityId'],
      })).toMatchSnapshot();
    });
  });
});
