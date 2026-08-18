import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import configType from '@/stores/reportsConfig/constants/configType';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

export default function getYAxisConfig({ type, yAxis, keySuffix }) {
  const suffix = keySuffix ? `${keySuffix}` : '';
  const typeKey = `yScaleType${suffix}`;
  const formatKey = `yScaleFormat${suffix}`;
  const LINEAR_PERCENTAGE_CONFIG = {
    [typeKey]: 'scaleLinear',
    [formatKey]: (val) => formatPercentage(val * 100),
  };
  const LINEAR_NUMERIC_CONFIG = {
    [typeKey]: 'scaleLinear',
    [formatKey]: (val) => formatNumber(val),
  };
  const TIME_SCALE_CONFIG = {
    [typeKey]: 'scaleTime',
    [formatKey]: (val) => formatSecondsFriendly(val / 1000, false, false),
  };
  const getYScaleConfig = ({ timeScale, linearPercentage, linearNumeric }) => {
    const timeScaleSet = new Set(timeScale || []);
    const linearPercentageSet = new Set(linearPercentage || []);
    const linearNumericSet = new Set(linearNumeric || []);
    if (timeScaleSet.has(yAxis)) return TIME_SCALE_CONFIG;
    if (linearPercentageSet.has(yAxis)) return LINEAR_PERCENTAGE_CONFIG;
    if (linearNumericSet.has(yAxis)) return LINEAR_NUMERIC_CONFIG;
    throw new Error('yAxis not defined in configuration');
  };
  const getDowntimeAxisConfig = () => getYScaleConfig({
    timeScale: [yAxisKey.VALUE, yAxisKey.AVG_DURATION_VAL],
    linearPercentage: [yAxisKey.ENTITY_PCT_PLANNED_TIME],
    linearNumeric: [yAxisKey.ENTITY_COUNT, yAxisKey.NOTES_COUNT],
  });
  const getSpeedlossAxisConfig = () => getYScaleConfig({
    timeScale: [yAxisKey.VALUE, yAxisKey.AVG_DURATION_VAL],
    linearPercentage: [],
    linearNumeric: [yAxisKey.ENTITY_COUNT, yAxisKey.NOTES_COUNT],
  });

  const getScrapAxisConfig = () => getYScaleConfig({
    timeScale: [],
    linearPercentage: [yAxisKey.SCRAP_QTY_PCT, yAxisKey.SCRAP_ALT_QTY_PCT, yAxisKey.ENTITY_PCT_PLANNED_TIME],
    linearNumeric: [yAxisKey.ENTITY_COUNT, yAxisKey.ENTITY_ALT_COUNT],
  });

  const getChecklistAxisConfig = () => getYScaleConfig({
    timeScale: [yAxisKey.AVG_TIME_VAL],
    linearPercentage: [yAxisKey.ENTITY_COUNT_PCT],
    linearNumeric: [yAxisKey.ENTITY_COUNT],
  });

  const getTimeUsageAxisConfig = () => getYScaleConfig({
    timeScale: [yAxisKey.DURATION],
    linearPercentage: [yAxisKey.VALUE, yAxisKey.PCT_OF_PLANNED_TIME],
  });

  const getProductionSpeedAxisConfig = () => getYScaleConfig({
    timeScale: [yAxisKey.PRODUCTION_TIME],
    linearNumeric: [yAxisKey.PRODUCTION_COUNT],
  });

  switch (type) {
    case configType.OEE: return LINEAR_PERCENTAGE_CONFIG;
    case configType.TIME_USAGE: return getTimeUsageAxisConfig();
    case configType.DOWNTIME: return getDowntimeAxisConfig();
    case configType.SPEEDLOSS: return getSpeedlossAxisConfig();
    case configType.SCRAPREASON: return getScrapAxisConfig();
    case configType.QUANTITY: return LINEAR_NUMERIC_CONFIG;
    case configType.CHECKLIST: return getChecklistAxisConfig();
    case configType.PRODUCTION_SPEED: return getProductionSpeedAxisConfig();
    default: {
      throw new Error('yAxisConfig type not matching');
    }
  }
}
