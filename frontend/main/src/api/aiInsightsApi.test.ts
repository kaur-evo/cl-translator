import { describe, it, expect, vi, beforeEach } from 'vitest';

import aiInsightsApi from '@/api/aiInsightsApi';
import request from '@/api/request';

vi.mock('@/api/request');

describe('aiInsightsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeNotes', () => {
    it('sends POST to /ai-insights/analyze-notes with payload', async () => {
      const mockResponse = { data: { status: 'accepted', requestId: 'test-123', message: 'ok' } };
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await aiInsightsApi.analyzeNotes({
        stationId: 1, stopReasonId: 5, startDate: '2024-01-01', endDate: '2024-12-31',
      });

      expect(request.post).toHaveBeenCalledWith(
        '/ai-insights/analyze-notes',
        { stationId: 1, stopReasonId: 5, startDate: '2024-01-01', endDate: '2024-12-31' },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('propagates errors from the request layer', async () => {
      vi.mocked(request.post).mockRejectedValue(new Error('Network error'));
      await expect(aiInsightsApi.analyzeNotes({
        stationId: 1, stopReasonId: 5, startDate: '2024-01-01', endDate: '2024-12-31',
      })).rejects.toThrow('Network error');
    });
  });
});
