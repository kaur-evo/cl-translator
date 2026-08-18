import { createTableHeadersConf } from './positionsTableHeadersConf';

describe('positionsTableHeadersConf', () => {
  it('is correct in listview', () => {
    expect(createTableHeadersConf(true)).toMatchSnapshot();
  });

  it('is correct in groupview', () => {
    expect(createTableHeadersConf(false)).toMatchSnapshot();
  });
});
