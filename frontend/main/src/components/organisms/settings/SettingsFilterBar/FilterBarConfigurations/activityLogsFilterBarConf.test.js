import { createSVFilterConfiguration, createSettingsFilterConfiguration } from './activityLogsFilterBarConf';

const store = {
  getters: {
    'station/getDefaultStation': () => ({ id: 1 }),
    'profile/firstDayOfWeek': 1,
    'feature/checklistsEnabled': () => true,
    'feature/securitySettingsEnabled': () => true,
  },
};
describe('activityLogsFilterBarConfg', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T10:15:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('that createSVFilterConfiguration matches snapshot', () => {
    expect(createSVFilterConfiguration(store.getters['profile/firstDayOfWeek'], store.getters['station/getDefaultStation']().id, store.getters['feature/checklistsEnabled'])).toMatchSnapshot();
  });

  test('that createSettingsFilterConfiguration matches snapshot', () => {
    expect(createSettingsFilterConfiguration(store.getters['profile/firstDayOfWeek'], store.getters['feature/checklistsEnabled'], store.getters['feature/securitySettingsEnabled'])).toMatchSnapshot();
  });
});
