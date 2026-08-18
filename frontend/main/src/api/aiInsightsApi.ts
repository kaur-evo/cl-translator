import request from './request';
import type {
  AnalyzeNotesRequest,
  AnalyzeNotesSuccessResponse,
} from './types/aiInsights';

const AI_INSIGHTS_BASE = '/ai-insights';

const aiInsightsApi = {
  async analyzeNotes(payload: AnalyzeNotesRequest): Promise<AnalyzeNotesSuccessResponse> {
    const { data } = await request.post(`${AI_INSIGHTS_BASE}/analyze-notes`, payload);
    return data;
  },
};

export default aiInsightsApi;
