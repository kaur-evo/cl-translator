const yAxisKey = {
  VALUE: 'value',
  ALT_VALUE: 'altValue',
  DURATION: 'duration',
  ENTITY_COUNT: 'entityCount',
  ENTITY_ALT_COUNT: 'entityAltCount',
  NOTES_COUNT: 'notesCount',
  AVG_DURATION_VAL: 'avgDurationVal',
  ENTITY_COUNT_PCT: 'entityCountPct',
  AVG_TIME_VAL: 'avgTimeVal',
  STOP_PCT_PLANNED_TIME: 'stopPctPlannedTime',
  SCRAP_QTY_PCT: 'scrapQtyPct',
  SCRAP_ALT_QTY_PCT: 'scrapAltQtyPct',
  SCRAP_PCT_PLANNED_TIME: 'scrapPctPlannedTime',
  PRODUCTION_COUNT: 'productionCount',
  PRODUCTION_TIME: 'productionTimeDt',
  ENTITY_PCT_PLANNED_TIME: 'entityPctPlannedTime',
  PCT_OF_PLANNED_TIME: 'pctOfPlannedTime',
} as const;

export type YAxisKey = typeof yAxisKey[keyof typeof yAxisKey];

export default yAxisKey;
