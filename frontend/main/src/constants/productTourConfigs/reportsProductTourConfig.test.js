import { getReportsProductTourConfig } from './reportsProductTourConfig';

describe('getReportsProductTourConfig', () => {
  test('reportsProductTourConfig if none of the flows is completed', () => {
    const flowStates = {
      reportsIntro: false,
      reportsSaving: false,
      reportsComparing: false,
      reportsExporting: false,
    };

    expect(getReportsProductTourConfig(flowStates)).toMatchSnapshot();
  });

  test('reportsProductTourConfig if all flows are completed', () => {
    const flowStates = {
      reportsIntro: true,
      reportsSaving: true,
      reportsComparing: true,
      reportsExporting: true,
    };

    expect(getReportsProductTourConfig(flowStates)).toMatchSnapshot();
  });
});
