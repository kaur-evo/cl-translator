export interface AnalyzeNotesRequest {
  stationId: number;
  stopReasonId: number;
  startDate: string; // ISO date: "YYYY-MM-DD"
  endDate: string; // ISO date: "YYYY-MM-DD"
  // Report filters to scope analysis to the user's active report view.
  // Passed through from buildQueryArgs. The backend filters the relevant keys
  // from this object; unrecognized keys are ignored.
  filters?: Record<string, unknown>;
  inverseFilter?: string[];
}

export interface AnalyzeNotesSuccessResponse {
  status: 'accepted';
  message: string;
  requestId: string;
}

/**
 * Standard error response shape returned by all AI Insights API endpoints.
 * Maps to the backend's ErrorResponse DTO.
 */
export interface ApiErrorResponse {
  status: 'error';
  errorCode: AiInsightsErrorCode;
  /**
   * Raw server message — use ERROR_MESSAGES[errorCode] with i18n for user-facing text.
   */
  message: string;
  details?: FieldError[];
  activeRequests?: number; // Only for QUEUE_FULL
  retryAfter?: number; // Seconds, only for QUEUE_FULL
  resetTime?: string; // ISO-8601, only for WEEKLY_LIMIT_REACHED
  hoursUntilReset?: number; // Only for WEEKLY_LIMIT_REACHED
}

/** Per-field validation error detail, included in VALIDATION_ERROR responses. */
export interface FieldError {
  field: string;
  message: string;
}

export type AiInsightsErrorCode
  = 'VALIDATION_ERROR'
    | 'INSUFFICIENT_NOTES'
    | 'TOO_MANY_NOTES'
    | 'FEATURE_DISABLED'
    | 'QUEUE_FULL'
    | 'WEEKLY_LIMIT_REACHED'
    | 'NOT_FOUND'
    | 'RATE_LIMIT_EXCEEDED'
    | 'INTERNAL_ERROR';

export interface ErrorEntry {
  message: (params?: Record<string, unknown>) => string;
  duration?: number;
}

export interface StopReasonEligibility {
  stopReasonId: number;
  stopReasonName: string | null;
  stations: EligibleStation[];
}

export interface EligibleStation {
  id: number;
  name: string;
  noteCount: number;
}
