import getBookmarkPresetDefaultsConfig from './bookmarkPresetDefaultsConfig';

describe('bookmarkPresetDefaultsConfig', () => {
  it('returns expected configuration snapshot when checklist are enabled', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: true,
      checklistStations: [1],
      checklistsEnabled: true,
      productionSpeedReportEnabled: false,
    });
    expect(configuration).toMatchSnapshot();
  });

  it('returns expected configuration snapshot with multiple factories', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: true,
      checklistStations: [],
      checklistsEnabled: false,
      productionSpeedReportEnabled: false,
    });
    expect(configuration).toMatchSnapshot();
  });

  it('returns expected configuration snapshot with single factory', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: false,
      checklistStations: [],
      checklistsEnabled: false,
      productionSpeedReportEnabled: false,
    });
    expect(configuration).toMatchSnapshot();
  });

  it('includes PRODUCTION_SPEED preset when productionSpeedReportEnabled is true', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: false,
      checklistStations: [],
      checklistsEnabled: false,
      productionSpeedReportEnabled: true,
    });
    expect(configuration.PRODUCTION_SPEED).toBeDefined();
    expect(configuration.PRODUCTION_SPEED.id).toBe('PRODUCTION_SPEED');
  });

  it('excludes PRODUCTION_SPEED preset when productionSpeedReportEnabled is false', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: false,
      checklistStations: [],
      checklistsEnabled: false,
      productionSpeedReportEnabled: false,
    });
    expect(configuration.PRODUCTION_SPEED).toBeUndefined();
  });

  it('includes both CHECKLIST and PRODUCTION_SPEED when both features are enabled', () => {
    const configuration = getBookmarkPresetDefaultsConfig({
      state: { bookmarkDefaults: {} },
      hasMultipleFactories: false,
      checklistStations: [1],
      checklistsEnabled: true,
      productionSpeedReportEnabled: true,
    });
    expect(configuration.CHECKLIST).toBeDefined();
    expect(configuration.PRODUCTION_SPEED).toBeDefined();
  });
});
