import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
}));

vi.mock('@/helpers/file/getAsset', () => ({
  getIconAsset: vi.fn((name) => name),
}));

vi.mock('@/constants/aiInsights', () => ({
  getAiInsightsIconId: vi.fn((id) => `ai-insights-icon-${id}`),
}));

vi.mock('@/helpers/aiInsights/getStopReasonId', () => ({
  getStopReasonId: vi.fn((item) => item.commentId || null),
}));

vi.mock('@/helpers/numbers/formatNumber', () => ({
  formatNumber: vi.fn((v) => v),
}));

vi.mock('@/helpers/time/formatDuration', () => ({
  default: vi.fn((v) => v),
}));

vi.mock('@/helpers/time/dateTimeFieldLabel', () => ({
  getLongDateTimeField: vi.fn(() => ''),
}));

vi.mock('@/stores/reportsConfig/configurations/labelsByChartTypeAndGrouping', () => ({
  getEntityLabelMap: vi.fn(() => ({})),
}));

vi.mock('@/stores/reportsConfig/configurations/shouldUseTotalMeasures', () => ({
  default: vi.fn(() => false),
}));

vi.mock('@/helpers/string-formatting', () => ({
  firstUpper: vi.fn((v) => v),
}));

import getDowntimeColumns from './downtimeColumns';

import { useAiInsightsStore } from '@/stores';

const defaultOptions = {
  granularity: 'total',
  groupBy: ['entityId'],
  yAxis: 'value',
  yAxisRight: undefined,
  durFormatType: 'HH:mm:ss',
};

describe('downtimeColumns — AI insights callbacks', () => {
  let columns;
  let aiInsightsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createTestingPinia({ createSpy: vi.fn }));
    aiInsightsStore = useAiInsightsStore();
    columns = getDowntimeColumns(defaultOptions);
  });

  describe('appendIconSrc', () => {
    it('returns icon path when item has AI insights', () => {
      const item = { _hasAiInsights: true, commentId: 42 };
      const result = columns.COMMENT.appendIconSrc(item);
      expect(result).toBe('artificialIntelligence.svg');
    });

    it('returns empty string when item does not have AI insights', () => {
      const item = { _hasAiInsights: false, commentId: 42 };
      const result = columns.COMMENT.appendIconSrc(item);
      expect(result).toBe('');
    });
  });

  describe('appendIconId', () => {
    it('returns icon ID when item has AI insights', () => {
      const item = { _hasAiInsights: true, commentId: 99 };
      const result = columns.COMMENT.appendIconId(item);
      expect(result).toBe('ai-insights-icon-99');
    });

    it('returns empty string when item does not have AI insights', () => {
      const item = { _hasAiInsights: false, commentId: 99 };
      const result = columns.COMMENT.appendIconId(item);
      expect(result).toBe('');
    });
  });

  describe('appendIconClickFn', () => {
    it('calls aiInsights openMenu with stop reason ID', () => {
      const item = { commentId: 55 };
      columns.COMMENT.appendIconClickFn(item);
      expect(aiInsightsStore.openMenu).toHaveBeenCalledWith(55);
    });

    it('does not call openMenu when stop reason ID is falsy', () => {
      const item = { commentId: null };
      columns.COMMENT.appendIconClickFn(item);
      expect(aiInsightsStore.openMenu).not.toHaveBeenCalled();
    });
  });
});
