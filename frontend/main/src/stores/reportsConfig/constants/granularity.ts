export const TOTAL = 'total' as const;
export const YEAR = 'year' as const;
export const QUARTER = 'quarter' as const;
export const MONTH = 'month' as const;
export const WEEKOFYEAR = 'weekofyear' as const;
export const DAYOFWEEK = 'dayofweek' as const;
export const DATE = 'date' as const;
export const STARTTIME = 'starttime' as const;
export const DUE_TIME = 'duetime' as const;

const granularityType = {
  TOTAL,
  YEAR,
  QUARTER,
  MONTH,
  WEEKOFYEAR,
  DAYOFWEEK,
  DATE,
  STARTTIME,
  DUE_TIME,
} as const;

export type GranularityType = typeof granularityType[keyof typeof granularityType];

export default granularityType;
