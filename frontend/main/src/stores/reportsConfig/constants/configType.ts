export const DOWNTIME = 'DOWNTIME' as const;
export const SPEEDLOSS = 'SPEEDLOSS' as const;
export const SCRAPREASON = 'SCRAPREASON' as const;
export const OEE = 'OEE' as const;
export const QUANTITY = 'QUANTITY' as const;
export const TIME_USAGE = 'TIME_USAGE' as const;
export const CUSTOM_REPORT = 'CUSTOM_REPORT' as const;
export const CHECKLIST = 'CHECKLIST' as const;
export const PRODUCTION_SPEED = 'PRODUCTION_SPEED' as const;

const configType = {
  DOWNTIME,
  SPEEDLOSS,
  SCRAPREASON,
  OEE,
  QUANTITY,
  TIME_USAGE,
  CUSTOM_REPORT,
  CHECKLIST,
  PRODUCTION_SPEED,
} as const;

export type ConfigType = typeof configType[keyof typeof configType];

export default configType;
