import mapperStackingConfig from './mapperStackingConfig';

describe('mapperStackingConfig', () => {
  test('if it returns expected configuration snapshot', () => {
    expect(mapperStackingConfig()).toMatchSnapshot();
  });
});
