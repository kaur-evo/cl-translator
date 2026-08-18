import { createTableHeadersConf } from './alertsTableHeadersConf';

describe('alertsTableHeadersConf', () => {
  it('should return the correct table headers configuration', () => {
    expect(createTableHeadersConf()).toMatchSnapshot();
  });
});
