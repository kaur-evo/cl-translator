import { getDashboardProductTourConfig } from './dashboardProductTourConfig';

describe('getDashboardProductTourConfig', () => {
  test('dashboardProductTourConfig if none of the flows is completed', () => {
    const flowStates = {
      dbOverview: false,
      dbCreation: false,
      dbInvolving: false,
    };

    expect(getDashboardProductTourConfig(flowStates)).toMatchSnapshot();
  });

  test('dashboardProductTourConfig if all flows are completed', () => {
    const flowStates = {
      dbOverview: true,
      dbCreation: true,
      dbInvolving: true,
    };

    expect(getDashboardProductTourConfig(flowStates)).toMatchSnapshot();
  });
});
