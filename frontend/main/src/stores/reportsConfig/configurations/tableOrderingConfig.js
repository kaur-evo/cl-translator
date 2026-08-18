import configType from '@/stores/reportsConfig/constants/configType';
import granularityType from '@/stores/reportsConfig/constants/granularity';

export default {
  [granularityType.STARTTIME]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.DUE_TIME]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.DATE]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.DAYOFWEEK]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.WEEKOFYEAR]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.MONTH]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.QUARTER]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.YEAR]: { orderBy: 'xScaleValue', orderDir: 'asc' },
  [granularityType.TOTAL]: {
    [configType.DOWNTIME]: { orderBy: 'value', orderDir: 'desc' },
    [configType.SPEEDLOSS]: { orderBy: 'value', orderDir: 'desc' },
    [configType.SCRAPREASON]: { orderBy: 'value', orderDir: 'desc' },
    [configType.OEE]: { orderBy: 'oee', orderDir: 'desc' },
    [configType.QUANTITY]: { orderBy: 'goodQty', orderDir: 'desc' },
    [configType.TIME_USAGE]: { orderBy: 'goodProduction', orderDir: 'desc' },
    [configType.CHECKLIST]: { orderBy: 'entityCount', orderDir: 'desc' },
    [configType.PRODUCTION_SPEED]: { orderBy: 'binOrder', orderDir: 'desc' },
  },
};
