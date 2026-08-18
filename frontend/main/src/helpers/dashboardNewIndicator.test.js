import { getTabNewIndicatorShownUntil, getLatestNewIndicatorShownUntil } from './dashboardNewIndicator';

describe('dashboardNewIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:56.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTabNewIndicatorShownUntil', () => {
    it('returns null when tab has no sharedAtISO', () => {
      const tab = { id: 1, name: 'Tab 1', sharedAtISO: null };
      expect(getTabNewIndicatorShownUntil(tab)).toBe(null);
    });

    it('returns null when tab is older than 30 days', () => {
      const tab = { id: 1, name: 'Tab 1', sharedAtISO: '2019-12-01T00:00:00.000Z' };
      expect(getTabNewIndicatorShownUntil(tab)).toBe(null);
    });

    it('returns tab sharedAtISO + 30 days when tab is created less than 30 days ago', () => {
      const tab = { id: 1, name: 'Tab 1', sharedAtISO: '2019-12-03T00:00:00.000Z' };
      expect(getTabNewIndicatorShownUntil(tab)).toBe('2020-01-02T00:00:00.000Z');
    });
  });

  describe('getLatestNewIndicatorShownUntil', () => {
    it('returns null when there are no tabs', () => {
      expect(getLatestNewIndicatorShownUntil([])).toBe(null);
    });

    it('returns null when none of the tabs have sharedAtISO', () => {
      const tabs = [
        { id: 1, name: 'Tab 1', sharedAtISO: null },
        { id: 2, name: 'Tab 2', sharedAtISO: null },
      ];
      expect(getLatestNewIndicatorShownUntil(tabs)).toBe(null);
    });

    it('returns null when all tabs have sharedAtISO, but are older than 30 days', () => {
      const tabs = [
        { id: 1, name: 'Tab 1', sharedAtISO: '2019-12-01T00:00:00.000Z' },
        { id: 2, name: 'Tab 2', sharedAtISO: '2019-12-02T00:00:00.000Z' },
      ];
      expect(getLatestNewIndicatorShownUntil(tabs)).toBe(null);
    });

    it('returns sharedAtISO + 30 days from an only tab that has sharedAtISO and is shared less than 30 days ago', () => {
      const tabs = [
        { id: 1, name: 'Tab 1', sharedAtISO: '2019-12-03T00:00:00.000Z' },
        { id: 2, name: 'Tab 2', sharedAtISO: null },
      ];
      expect(getLatestNewIndicatorShownUntil(tabs)).toBe('2020-01-02T00:00:00.000Z');
    });

    it('returns sharedAtISO + 30 days of the latest tab shared less than 30 days ago', () => {
      const tabs = [
        { id: 1, name: 'Tab 1', sharedAtISO: '2019-12-12T00:00:00.000Z' },
        { id: 2, name: 'Tab 2', sharedAtISO: '2019-12-11T00:00:00.000Z' },
      ];
      expect(getLatestNewIndicatorShownUntil(tabs)).toBe('2020-01-11T00:00:00.000Z');
    });
  });
});
