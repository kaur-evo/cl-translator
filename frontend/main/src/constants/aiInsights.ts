export const MIN_NOTES_FOR_ELIGIBILITY = 50;
export const EMAIL_CONFIRMATION_DIALOG_WIDTH = 700;

/** Generates the DOM element ID for an AI insights icon anchored to a stop reason row */
export const getAiInsightsIconId = (stopReasonId: number): string => `ai-insights-icon-${stopReasonId}`;
