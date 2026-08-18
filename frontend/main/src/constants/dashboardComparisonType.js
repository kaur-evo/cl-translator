
import timePeriodType from '@/constants/predefinedTimePeriodNames';
import widgetType from '@/constants/dashboardWidgetTypes';

const comparisonType = {
  NO_COMPARISON: 'NO_COMPARISON',
  COMPARISON_WITH_PREVIOUS: 'COMPARISON_WITH_PREVIOUS',
  COMPARISON_WITH_PREVIOUS_FULL: 'COMPARISON_WITH_PREVIOUS_FULL',
};

const allowedTypesMap = {
  [comparisonType.COMPARISON_WITH_PREVIOUS]: {
    widgetType: {
      [widgetType.DELAYS_CHART]: {
        periodType: new Set(Object.values(timePeriodType)),
      },
      [widgetType.OEE_CHART]: {
        periodType: new Set(Object.values(timePeriodType)),
      },
      [widgetType.SCRAP_CHART]: {
        periodType: new Set(Object.values(timePeriodType)),
      },
      [widgetType.SPEEDLOSS_CHART]: {
        periodType: new Set(Object.values(timePeriodType)),
      },
    },
  },
  [comparisonType.COMPARISON_WITH_PREVIOUS_FULL]: {
    widgetType: {
      [widgetType.DELAYS_CHART]: {
        periodType: new Set([
          timePeriodType.THIS_WEEK,
          timePeriodType.THIS_MONTH,
          timePeriodType.THIS_YEAR,
        ]),
      },
      [widgetType.SCRAP_CHART]: {
        periodType: new Set([
          timePeriodType.THIS_WEEK,
          timePeriodType.THIS_MONTH,
          timePeriodType.THIS_YEAR,
        ]),
      },
      [widgetType.SPEEDLOSS_CHART]: {
        periodType: new Set([
          timePeriodType.THIS_WEEK,
          timePeriodType.THIS_MONTH,
          timePeriodType.THIS_YEAR,
        ]),
      },
    },
  },
};

export function comparisonExists(type) {
  return comparisonType[type] !== undefined;
}

export function isComparisonTypeAllowed(period, widget, comparison) {
  const comparisonTypeSettings = allowedTypesMap[comparison];
  if (comparisonTypeSettings === undefined) return false;
  const widgetTypeSettings = comparisonTypeSettings.widgetType[widget];
  if (widgetTypeSettings === undefined) return false;
  const allowedForPeriod = widgetTypeSettings.periodType.has(period);

  return allowedForPeriod;
}

export function getComparisonType({
  includeComparison, _periodType, _widgetType, _comparisonType,
}) {
  const exists = comparisonExists(_comparisonType);
  if (exists) return _comparisonType;

  // legacy fallback
  if (includeComparison) {
    if (isComparisonTypeAllowed(_periodType, _widgetType, comparisonType.COMPARISON_WITH_PREVIOUS)) {
      return comparisonType.COMPARISON_WITH_PREVIOUS;
    }
    if (isComparisonTypeAllowed(_periodType, _widgetType, comparisonType.COMPARISON_WITH_PREVIOUS_FULL)) {
      return comparisonType.COMPARISON_WITH_PREVIOUS_FULL;
    }
  }
  return comparisonType.NO_COMPARISON;
}

export default comparisonType;
