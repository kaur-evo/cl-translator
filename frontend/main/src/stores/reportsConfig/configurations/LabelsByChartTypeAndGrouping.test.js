import { getEntityLabelMap } from './labelsByChartTypeAndGrouping';

describe('LabelsByChartTypeAndGrouping', () => {
  test('if it returns expected configuration snapshot', () => {
    expect(getEntityLabelMap()).toMatchSnapshot();
  });
});
