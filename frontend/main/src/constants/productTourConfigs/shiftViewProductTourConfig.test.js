import { getShiftViewProductTourConfig } from './shiftViewProductTourConfig';

describe('getShiftViewProductTourConfig', () => {
  test('shiftViewProductTourConfig if none of the flows is completed', () => {
    const flowStates = {
      svWelcome: false,
      svIntro: false,
      svDtTracking: false,
      svMonitoring: false,
      svRecording: false,
      svEngagement: false,
    };

    expect(getShiftViewProductTourConfig(flowStates)).toMatchSnapshot();
  });

  test('shiftViewProductTourConfig if all flows are completed', () => {
    const flowStates = {
      svWelcome: true,
      svIntro: true,
      svDtTracking: true,
      svMonitoring: true,
      svRecording: true,
      svEngagement: true,
    };

    expect(getShiftViewProductTourConfig(flowStates)).toMatchSnapshot();
  });
});
