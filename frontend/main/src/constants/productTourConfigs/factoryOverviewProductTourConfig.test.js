import { getFactoryOverviewProductTourConfig } from './factoryOverviewProductTourConfig';

describe('getFactoryOverviewProductTourConfig', () => {
  test('factoryOverviewProductTourConfig if none of the flows is completed', () => {
    const flowStates = {
      foIntro: false,
      foLiveIntro: false,
      foTimelineIntro: false,
      foGrid: false,
    };

    expect(getFactoryOverviewProductTourConfig(flowStates)).toMatchSnapshot();
  });

  test('factoryOverviewProductTourConfig if all flows are completed', () => {
    const flowStates = {
      foIntro: true,
      foLiveIntro: true,
      foTimelineIntro: true,
      foGrid: true,
    };

    expect(getFactoryOverviewProductTourConfig(flowStates)).toMatchSnapshot();
  });
});
