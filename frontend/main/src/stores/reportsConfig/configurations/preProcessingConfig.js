import config from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';
import {
  COLOR_AVAILABILITY, COLOR_OEE, COLOR_PERFORMANCE, COLOR_QUALITY,
  COLOR_TECHNICAL_AVAILABILITY, COLOR_GOOD_ALT, COLOR_POTENTIAL,
  COLOR_GOOD, COLOR_PLANNED_NOT_INCLUDED_IN_OEE, COLOR_PLANNED_INCLUDED_IN_OEE,
  COLOR_COMMENTED, COLOR_UNCOMMENTED, COLOR_ERROR,
} from '@/stores/reportsConfig/constants/colors';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import formatNumberWithOptions from '@/helpers/numbers/formatNumberWithOptions';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';

export const getTargetVal = (target) => (target?.length ? target[0] : 0);

export const hasTarget = (target) => Array.isArray(target) && target.length > 0 && target[0] !== 0 && target[0] !== null;

export const isFasterThanTarget = (entry, requirements) => {
  if (!hasTarget(entry.target)) {
    return true;
  }
  if (requirements.groupBy[0] === 'SECOND_PER_UNIT') {
    return entry.rangestart <= getTargetVal(entry.target);
  }
  return entry.rangeend >= getTargetVal(entry.target);
};
export default function getPrerocessingConfig({ formattingOptions, requirements } = {}) {
  const numberFormattingOptions = formattingOptions?.numberFormattingOptions ?? defaultNumberFormattingOptions;
  const oeePreCalcGroupingConfig = new Map([
    [preprocessorGroupType.OEE, {
      order: 5,
      mapKeys: [
        ['qty', 'definedQty'],
        ['scrapqty', 'definedScrapQty'],
        ['rowproducedqty', 'oeeGroupTotalQty'],
        ['rowproducedaltqty', 'oeeGroupTotalAltQty'],
        ['plannedstopnotincludedinoee', 'oeeGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'oeeGroupPlannedTime'],
        [specialKey.CALENDAR_TIME_SEC, 'oeeGroupCalendarTimeSec'],
      ],
      overwrite: {
        entityGroupName: i18n.global.t('oee'),
        color: COLOR_OEE,
      },
    }],
    [preprocessorGroupType.AVAILABILITY, {
      order: 4,
      mapKeys: [
        ['productiontime', 'availabilityGroupProductionTime'],
        ['rowproducedqty', 'availabilityGroupTotalQty'],
        ['rowproducedaltqty', 'availabilityGroupTotalAltQty'],
        ['qty', 'definedQty'],
        ['scrapqty', 'definedScrapQty'],
        ['plannedstopnotincludedinoee', 'availabilityGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'availabilityGroupPlannedTime'],
        [specialKey.CALENDAR_TIME_SEC, 'availabilityGroupCalendarTimeSec'],
      ],
      deleteKeys: ['rowproducedqty'],
      overwrite: {
        entityGroupName: i18n.global.t('availability'),
        idealperformanceqty: 0,
        qty: 0,
        productiontime: 0,
        plannedtime: 0,
        technicalstop: 0,
        scrapqty: 0,
        color: COLOR_AVAILABILITY,
      },
    }],
    [preprocessorGroupType.PERFORMANCE, {
      order: 3,
      mapKeys: [
        ['idealperformanceqty', 'performanceGroupIdealPerfQty'],
        ['qty', 'performanceGroupQty'],
        ['rowproducedqty', 'performanceGroupTotalQty'],
        ['rowproducedaltqty', 'performanceGroupTotalAltQty'],
        ['qty', 'definedQty'],
        ['scrapqty', 'definedScrapQty'],
        ['plannedstopnotincludedinoee', 'performanceGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'performanceGroupPlannedTime'],
        [specialKey.CALENDAR_TIME_SEC, 'performanceGroupCalendarTimeSec'],
      ],
      deleteKeys: ['rowproducedqty'],
      overwrite: {
        entityGroupName: i18n.global.t('performance'),
        idealperformanceqty: 0,
        qty: 0,
        productiontime: 0,
        plannedtime: 0,
        technicalstop: 0,
        scrapqty: 0,
        color: COLOR_PERFORMANCE,
      },
    }],
    [preprocessorGroupType.QUALITY, {
      order: 2,
      mapKeys: [
        ['scrapqty', 'qualityGroupScrapQty'],
        ['qty', 'qualityGroupQty'],
        ['rowproducedqty', 'qualityGroupTotalQty'],
        ['rowproducedaltqty', 'qualityGroupTotalAltQty'],
        ['qty', 'definedQty'],
        ['scrapqty', 'definedScrapQty'],
        ['plannedstopnotincludedinoee', 'qualityGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'qualityGroupPlannedTime'],
        [specialKey.CALENDAR_TIME_SEC, 'qualityGroupCalendarTimeSec'],
      ],
      deleteKeys: ['rowproducedqty'],
      overwrite: {
        entityGroupName: i18n.global.t('quality'),
        idealperformanceqty: 0,
        qty: 0,
        productiontime: 0,
        plannedtime: 0,
        technicalstop: 0,
        scrapqty: 0,
        color: COLOR_QUALITY,
      },
    }],
    [preprocessorGroupType.TECHNICAL_AVAILABILITY, {
      order: 1,
      mapKeys: [
        ['technicalstop', 'technicalGroupTechnicalStop'],
        ['plannedtime', 'technicalGroupPlannedTime'],
        ['rowproducedqty', 'technicalGroupTotalQty'],
        ['rowproducedaltqty', 'technicalGroupTotalAltQty'],
        ['qty', 'definedQty'],
        ['scrapqty', 'definedScrapQty'],
        ['plannedstopnotincludedinoee', 'technicalGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'technicalGroupPlannedTime'],
        [specialKey.CALENDAR_TIME_SEC, 'technicalGroupCalendarTimeSec'],
      ],
      deleteKeys: ['rowproducedqty'],
      overwrite: {
        entityGroupName: i18n.global.t('technicalavailability'),
        idealperformanceqty: 0,
        qty: 0,
        productiontime: 0,
        plannedtime: 0,
        technicalstop: 0,
        scrapqty: 0,
        color: COLOR_TECHNICAL_AVAILABILITY,
      },
    }],
  ]);

  const qtyPreCalcGroupingConfig = new Map([
    [preprocessorGroupType.SCRAP, {
      order: 1,
      mapKeys: [
        ['rowproducedqty', 'scrapGroupTotalQty'],
        ['rowproducedaltqty', 'scrapGroupTotalAltQty'],
        ['scrapqty', 'scrapGroupScrapQty'],
        ['scrapaltqty', 'scrapGroupScrapAltQty'],
        ['idealqty', 'scrapGroupIdealQty'],
        ['idealaltqty', 'scrapGroupIdealAltQty'],
        ['idealperformanceqty', 'scrapGroupIdealPerformanceQty'],
        ['idealperformancealtqty', 'scrapGroupIdealPerformanceAltQty'],
      ],
      deleteKeys: ['rowproducedqty', 'goodqty', 'idealqty', 'scrapqty', 'rowproducedaltqty', 'goodaltqty', 'idealaltqty', 'scrapaltqty'],
      overwrite: {
        entityGroupName: i18n.global.t('Scrap'),
        color: COLOR_QUALITY,
      },
    }],
    [preprocessorGroupType.GOOD, {
      order: 2,
      mapKeys: [
        ['rowproducedqty', 'goodGroupTotalQty'],
        ['rowproducedaltqty', 'goodGroupTotalAltQty'],
        ['goodqty', 'goodGroupGoodQty'],
        ['goodaltqty', 'goodGroupGoodAltQty'],
        ['idealqty', 'goodGroupIdealQty'],
        ['idealaltqty', 'goodGroupIdealAltQty'],
        ['idealperformanceqty', 'goodGroupIdealPerformanceQty'],
        ['idealperformancealtqty', 'goodGroupIdealPerformanceAltQty'],
      ],
      deleteKeys: ['rowproducedqty', 'goodqty', 'idealqty', 'scrapqty', 'rowproducedaltqty', 'goodaltqty', 'idealaltqty', 'scrapaltqty'],
      overwrite: {
        entityGroupName: i18n.global.t('Good quantity'),
        color: COLOR_GOOD_ALT,
      },
    }],
    [preprocessorGroupType.POTENTIAL, {
      order: 3,
      mapKeys: [
        ['rowproducedqty', 'potentialGroupTotalQty'],
        ['rowproducedaltqty', 'potentialGroupTotalAltQty'],
        ['idealqty', 'potentialGroupIdealQty'],
        ['idealaltqty', 'potentialGroupIdealAltQty'],
        ['idealperformanceqty', 'potentialGroupIdealPerformanceQty'],
        ['idealperformancealtqty', 'potentialGroupIdealPerformanceAltQty'],
      ],
      deleteKeys: ['rowproducedqty', 'goodqty', 'idealqty', 'scrapqty', 'rowproducedaltqty', 'goodaltqty', 'idealaltqty', 'scrapaltqty'],
      overwrite: {
        entityGroupName: i18n.global.t('Potential'),
        color: COLOR_POTENTIAL,
      },
    }],
  ]);

  const timeUsagePreCalcGroupingConfig = new Map([
    [preprocessorGroupType.GOOD, {
      order: 1,
      mapKeys: [
        ['plannedstop', 'goodGroupPlannedStop'],
        ['plannedstopincludedinoee', 'goodGroupPlannedStopIncludedInOEE'],
        ['plannedstopnotincludedinoee', 'goodGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'goodGroupPlannedTime'],
        ['goodproduction', 'goodGroupGoodProduction'],
      ],
      overwrite: {
        entityGroupName: i18n.global.t('goodproduction'),
        color: COLOR_GOOD,
      },
    }],
    [preprocessorGroupType.SLOW, {
      order: 2,
      mapKeys: [
        ['plannedstop', 'slowGroupPlannedStop'],
        ['plannedstopincludedinoee', 'slowGroupPlannedStopIncludedInOEE'],
        ['plannedstopnotincludedinoee', 'slowGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'slowGroupPlannedTime'],
        ['slowproduction', 'slowGroupSlowProduction'],
      ],
      overwrite: {
        entityGroupName: i18n.global.t('Speed loss'),
        color: COLOR_PERFORMANCE,
      },
    }],
    [preprocessorGroupType.UNPLANNED_STOP, {
      order: 3,
      mapKeys: [
        ['plannedstop', 'unplannedStopGroupPlannedStop'],
        ['plannedstopincludedinoee', 'unplannedStopGroupPlannedStopIncludedInOEE'],
        ['plannedstopnotincludedinoee', 'unplannedStopGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'unplannedStopGroupPlannedTime'],
        ['unplannedstop', 'unplannedStopGroupUnplannedStop'],
      ],
      overwrite: {
        entityGroupName: i18n.global.t('Unplanned stops'),
        color: COLOR_COMMENTED,
      },
    }],
    [preprocessorGroupType.UNCOMMENTED_STOP, {
      order: 4,
      mapKeys: [
        ['plannedstop', 'uncommentedStopGroupPlannedStop'],
        ['plannedstopincludedinoee', 'uncommentedStopGroupPlannedStopIncludedInOEE'],
        ['plannedstopnotincludedinoee', 'uncommentedStopGroupPlannedStopNotIncludedInOEE'],
        ['plannedtime', 'uncommentedStopGroupPlannedTime'],
        ['uncommentedstop', 'uncommentedStopGroupUncommentedStop'],
      ],
      overwrite: {
        entityGroupName: i18n.global.t('Uncommented'),
        color: COLOR_UNCOMMENTED,
      },
    }],
    [preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE, {
      order: 5,
      mapKeys: [
        ['plannedstop', 'plannedStopInclGroupPlannedStop'],
        ['plannedstopincludedinoee', 'plannedStopInclGroupPlannedStopIncludedInOEE'],
        ['plannedtime', 'plannedStopInclGroupPlannedTime'],
        ['plannedstopnotincludedinoee', 'plannedStopInclGroupPlannedStopNotIncludedInOEE'],
      ],
      overwrite: {
        entityGroupName: `${i18n.global.t('Planned stops')} (${i18n.global.t('incl. in OEE')})`,
        color: COLOR_PLANNED_INCLUDED_IN_OEE,
      },
    }],
    [preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE, {
      order: 6,
      mapKeys: [
        ['plannedstop', 'plannedStopNotInclGroupPlannedStop'],
        ['plannedstopincludedinoee', 'plannedStopNotInclGroupPlannedStopIncludedInOEE'],
        ['plannedtime', 'plannedStopNotInclGroupPlannedTime'],
        ['plannedstopnotincludedinoee', 'plannedStopNotInclGroupPlannedStopNotIncludedInOEE'],
      ],
      overwrite: {
        entityGroupName: `${i18n.global.t('Planned stops')} (${i18n.global.t('excl. from OEE')})`,
        color: COLOR_PLANNED_NOT_INCLUDED_IN_OEE,
      },
    }],
  ]);

  const checklistsPreCalcGroupingConfig = new Map([
    [preprocessorGroupType.CHECKLIST_SUCCESSFUL, {
      order: 1,
      mapKeys: [
        ['totalcheckcount', 'successfulGroupTotalQty'],
        ['successfulcheckcount', 'successfulGroupSuccessfulQty'],
        ['successfulcheckduration', 'successfulGroupSuccessfulTime'],
      ],
      deleteKeys: ['totalcheckcount', 'successfulcheckcount', 'unsuccessfulcheckcount', 'missedcheckcount', 'missedcheckduration', 'unsuccessfulcheckduration', 'successfulcheckduration'],
      overwrite: {
        entityGroupName: i18n.global.t('Successful'),
        color: COLOR_GOOD,
      },
    }],
    [preprocessorGroupType.CHECKLIST_UNSUCCESSFUL, {
      order: 2,
      mapKeys: [
        ['totalcheckcount', 'unsuccessfulGroupTotalQty'],
        ['unsuccessfulcheckcount', 'unsuccessfulGroupUnsuccessfulQty'],
        ['unsuccessfulcheckduration', 'unsuccessfulGroupUnsuccessfulTime'],
      ],
      deleteKeys: ['totalcheckcount', 'successfulcheckcount', 'unsuccessfulcheckcount', 'missedcheckcount', 'missedcheckduration', 'unsuccessfulcheckduration', 'successfulcheckduration'],
      overwrite: {
        entityGroupName: i18n.global.t('Unsuccessful'),
        color: COLOR_QUALITY,
      },
    }],
    [preprocessorGroupType.CHECKLIST_MISSED, {
      order: 3,
      mapKeys: [
        ['totalcheckcount', 'missedGroupTotalQty'],
        ['missedcheckcount', 'missedGroupMissedQty'],
        ['missedcheckduration', 'missedGroupMissedTime'],
      ],
      deleteKeys: ['totalcheckcount', 'successfulcheckcount', 'unsuccessfulcheckcount', 'missedcheckcount', 'missedcheckduration', 'unsuccessfulcheckduration', 'successfulcheckduration'],
      overwrite: {
        entityGroupName: i18n.global.t('Missed'),
        color: COLOR_ERROR,
      },
    }],
  ]);

  const oeePreCalcConfig = {
    deleteKeys: [
      'oee', 'oeeValue', 'availability', 'availabilityValue',
      'performance', 'performanceValue', 'quality', 'qualityValue',
      'technicalavailability', 'technicalavailabilityValue',
    ],
    groupingConfig: oeePreCalcGroupingConfig,
  };
  const qtyPreCalcConfig = {
    deleteKeys: [],
    groupingConfig: qtyPreCalcGroupingConfig,
  };
  const timeUsagePreCalcConfig = {
    deleteKeys: [],
    groupingConfig: timeUsagePreCalcGroupingConfig,
  };
  const checklistsPreCalcConfig = {
    deleteKeys: [],
    groupingConfig: checklistsPreCalcGroupingConfig,
  };
  const productionSpeedPreCalcConfig = {
    calculateKeys: new Map([
      ['isFasterThanTarget', (entry) => isFasterThanTarget(entry, requirements)],
      ['color', (entry) => (isFasterThanTarget(entry, requirements) ? COLOR_GOOD : COLOR_ERROR)],
      ['belowTargetCount', (entry) => (isFasterThanTarget(entry, requirements) ? entry.count : 0)],
      ['entityGroupName', (entry) => {
        if (!hasTarget(entry.target)) {
          return productionSpeedLegendType.BELOW_TARGET;
        }
        return isFasterThanTarget(entry, requirements) ? productionSpeedLegendType.BELOW_TARGET : productionSpeedLegendType.ABOVE_TARGET;
      }],
      ['containsTarget', (entry) => entry.rangestart <= getTargetVal(entry.target) && entry.rangeend >= getTargetVal(entry.target)],
      ['containsMode', (entry) => entry.rangestart <= entry.mode && entry.rangeend >= entry.mode],
      ['midPoint', (entry) => formatNumberWithOptions((entry.rangestart + entry.rangeend) / 2, numberFormattingOptions)],
    ]),
    groupingConfig: new Map(),
  };
  return new Map([
    [config.OEE, oeePreCalcConfig],
    [config.QUANTITY, qtyPreCalcConfig],
    [config.TIME_USAGE, timeUsagePreCalcConfig],
    [config.CHECKLIST, checklistsPreCalcConfig],
    [config.PRODUCTION_SPEED, productionSpeedPreCalcConfig],
  ]);
}
