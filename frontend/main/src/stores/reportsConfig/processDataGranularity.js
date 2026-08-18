import {
  isNumber, mergeWith, sortBy, isArray, isString, isSet, isFunction,
} from 'lodash';

import setUnion from '@/helpers/Set/setUnion';
import CommentDataMap from '@/stores/reportsConfig/maps/CommentDataMap';
import PerformanceCommentDataMap from '@/stores/reportsConfig/maps/PerformanceCommentDataMap';
import ScrapDataMap from '@/stores/reportsConfig/maps/ScrapDataMap';
import OEEDataMap from '@/stores/reportsConfig/maps/OEEDataMap';
import QuantityDataMap from '@/stores/reportsConfig/maps/QuantityDataMap';
import TimeUsageDataMap from '@/stores/reportsConfig/maps/TimeUsageDataMap';
import ChecklistsDataMap from '@/stores/reportsConfig/maps/ChecklistsDataMap';
import config from '@/stores/reportsConfig/constants/configType';
import ReportsDataPreprocessor from '@/stores/reportsConfig/ReportsDataPreprocessor';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import {
  getPrimaryGroupBy, getHighestLevelGroupBy, getHighestLevelGroupBySorting, getSecondaryGroupBy,
} from '@/stores/reportsConfig/configurations/dataGroupingConfig';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import getChartLegendConfig from '@/stores/reportsConfig/configurations/chartLegendConfig';
import ProductionSpeedDataMap from '@/stores/reportsConfig/maps/ProductionSpeedDataMap';
import measure from '@/stores/reportsConfig/constants/measure';
import remapObjKeys from '@/helpers/object/remapObjKeys';

const remapKeysConfig = [
  ['shifttemplate', 'shifttemplatelabel'],
  ['sku', 'skulabel'],
];

const createMapper = (item, configType, _requirements, index, formattingOptions) => {
  const configDataMapperMap = {
    [config.DOWNTIME]: () => new CommentDataMap(item, { ..._requirements, formattingOptions }),
    [config.SPEEDLOSS]: () => new PerformanceCommentDataMap(item, { ..._requirements, formattingOptions }),
    [config.SCRAPREASON]: () => new ScrapDataMap(item, { ..._requirements, formattingOptions }),
    [config.OEE]: () => new OEEDataMap(item, { ..._requirements, index, formattingOptions }),
    [config.QUANTITY]: () => new QuantityDataMap(item, { ..._requirements, index, formattingOptions }),
    [config.TIME_USAGE]: () => new TimeUsageDataMap(item, { ..._requirements, index, formattingOptions }),
    [config.CHECKLIST]: () => new ChecklistsDataMap(item, { ..._requirements, formattingOptions }),
    [config.PRODUCTION_SPEED]: () => new ProductionSpeedDataMap(item, { ..._requirements, formattingOptions }),
  };
  if (configDataMapperMap[configType] === undefined) {
    throw new Error(`${configType} missing from granularity processor`);
  }
  return configDataMapperMap[configType]();
};

export function convertToSet(destValue, srcValue) {
  const isSrcSet = isSet(srcValue);
  const isDestSet = isSet(destValue);
  if (isSrcSet && isDestSet) {
    return setUnion(destValue, srcValue);
  }
  if (isSrcSet) {
    return srcValue;
  }
  if (isDestSet && isArray(srcValue)) {
    return setUnion(destValue, new Set(srcValue));
  }
  if (isDestSet) {
    if (destValue.has(srcValue)) return destValue;
    return destValue.add(srcValue);
  }
  if (isArray(srcValue)) {
    return new Set(srcValue);
  }
  return new Set([srcValue]);
}

// LOGIC OF HOW ENTRY KEY VALUES ARE MERGED
// eslint-disable-next-line sonarjs/cognitive-complexity
export function mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys }) {
  if (ignoreKeys.has(mergeKey)) {
    return srcValue;
  }
  if (primaryKeys.has(mergeKey)) {
    if (isArray(srcValue)) {
      if (srcValue.length > 1) throw new Error('Only one key is supported for grouping');
      return srcValue[0];
    }
    return srcValue;
  }

  if (convertToSetKeys.has(mergeKey)) {
    const ret = convertToSet(destValue, srcValue);
    return ret;
  }
  if (isNumber(srcValue)) {
    if (!destValue) return srcValue;
    return Number(destValue) + Number(srcValue);
  }
  if (isString(srcValue)) {
    return convertToSet(destValue, srcValue);
  }
  if (isSet(srcValue)) {
    if (destValue) {
      return setUnion(destValue, srcValue);
    }
    return srcValue;
  }
  if (isArray(srcValue)) {
    if (isSet(destValue)) {
      return setUnion(new Set(srcValue), destValue);
    }
    return new Set(srcValue);
  }

  return srcValue;
}

const TOTALS_GROUP_KEY = '%totals';
export function getGroupingVal(object, key) {
  if (key === TOTALS_GROUP_KEY) return key;
  let keyValue;
  if (isFunction(key)) {
    keyValue = key(object);
  } else {
    keyValue = object[key];
  }
  if (isSet(keyValue)) {
    if (keyValue.size > 1) throw new Error(`Only one key is supported for grouping :${keyValue}`);
    [keyValue] = Array.from(keyValue);
  } else if (isArray(keyValue)) {
    if (keyValue.length > 1) throw new Error(`Only one key is supported for grouping: ${keyValue}`);
    [keyValue] = keyValue;
  }
  if (keyValue === undefined && (object.isFake || object.noData)) {
    return null;
  }
  return keyValue;
}

export function merge(accumulator, object, key, { ignoreKeys, primaryKeys, convertToSetKeys }) {
  const accu = accumulator ?? new Map();
  const groupingValue = getGroupingVal(object, key);
  if (accu.has(groupingValue)) {
    const prevState = { ...accu.get(groupingValue) };
    accu.set(groupingValue, mergeWith(prevState, { ...object }, (destValue, srcValue, mergeKey) => mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys })));
  } else {
    const mergeResult = mergeWith({}, { ...object }, (destValue, srcValue, mergeKey) => mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys }));
    accu.set(groupingValue, mergeResult);
  }
  return accu;
}

export function mapToStackList(map, stackingKey, { isStacked, chartLegendState, hiddenGroupingValues }) {
  const getValue = (val) => val?.getTime?.() ?? val;
  const addValues = (prevVal, currVal) => {
    const prev = getValue(prevVal);
    const curr = getValue(currVal);
    if (currVal?.getTime?.()) {
      return new Date(prev + curr);
    }
    return prev + curr;
  };

  let prevAccumulatingValue = 0;
  let stackMax = 0;
  let stackCount = 0;
  const stackList = [];
  map.forEach((entry, groupingValue) => {
    let currentValue = 0;
    let newValue = 0;
    const isSetInURL = () => chartLegendState.size && chartLegendState?.has?.(groupingValue); // OEE/QUANTITY/TIME_USAGE
    const isSetInNonURLStoredState = () => !chartLegendState.size && !hiddenGroupingValues?.has?.(groupingValue); // DOWNTIME/SCRAPREASON/SPEEDLOSS
    if (entry.stackCount !== undefined) {
      // carries over stack data from previous levels
      stackCount += entry.stackCount;
      stackMax = entry.stackMax;
    } else if (isSetInURL() || isSetInNonURLStoredState()) {
      // filters out toggled from legend,
      // keeping the stack with height 0 for enter and exit animation
      stackCount += 1;
      currentValue = entry[stackingKey];
    }
    newValue = addValues(prevAccumulatingValue, currentValue);

    const stackEntry = [prevAccumulatingValue, newValue];
    stackEntry.data = entry;

    if (isStacked) {
      prevAccumulatingValue = newValue;
    }
    if (newValue > stackMax) {
      stackMax = newValue;
    }
    stackList.push(stackEntry);
  });
  return { stackList, stackMax, stackCount };
}

export function calcGroupPseudoKey(entry, level, keys) {
  const currentGroupKeys = keys.slice(level, keys.length);
  const groupingKeyVals = currentGroupKeys.map((key) => getGroupingVal(entry, key));
  return groupingKeyVals.reverse().join('-');
}

export function isLastOfTotals(groupByKey, entryIndex, sortedEntries) {
  return groupByKey === TOTALS_GROUP_KEY && entryIndex + 1 === sortedEntries.length;
}

export function isLastOfGroup(currentEntry, nextEntry, groupByKeyIndex, groupByKeysReversed) {
  if (nextEntry === undefined) return true;
  const pseudoGroupingvalue = calcGroupPseudoKey(currentEntry, groupByKeyIndex, groupByKeysReversed);
  const nextPseudoGroupingValue = calcGroupPseudoKey(nextEntry, groupByKeyIndex, groupByKeysReversed);
  return pseudoGroupingvalue !== nextPseudoGroupingValue;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function groupAndMergeEntries(entries, groupingKeys, sortingKeys, requirements, configType, {
  formatGroupFn, isStacked, convertToSetKeys, chartLegendState, hiddenGroupingValues, formattingOptions,
}) {
  const groupByKeys = [TOTALS_GROUP_KEY, ...groupingKeys];
  const primaryKeys = new Set([...groupByKeys]);
  if (primaryKeys.has('singleoperator')) primaryKeys.add('singleoperatorId');
  const groupByKeysReversed = [...groupByKeys].reverse();
  const stackLegend = new Map();
  const sortedEntries = sortBy(entries, sortingKeys); // correct order is CRUCIAL for this to work
  const currentLevelMaps = [];
  let latestMergeResult = null;
  for (let entryIndex = 0; entryIndex < sortedEntries.length; entryIndex += 1) {
    let { ...entry } = sortedEntries[entryIndex];
    if (requirements.granularity === granularityType.DAYOFWEEK) {
      const weekStarstOnSunday = formattingOptions.firstDayOfWeek === '0';
      if (entry[granularityType.DAYOFWEEK]?.length === 1 && entry[granularityType.DAYOFWEEK][0] === '7' && weekStarstOnSunday) {
        entry[granularityType.DAYOFWEEK] = ['0'];
      }
    }
    entry = remapObjKeys(entry, remapKeysConfig);
    const nextEntry = sortedEntries[entryIndex + 1];
    for (let groupByKeyIndex = 0; groupByKeyIndex < groupByKeysReversed.length; groupByKeyIndex += 1) {
      const isHighestLevel = groupByKeyIndex === 0;
      const groupByKey = groupByKeysReversed[groupByKeyIndex];
      const currentEntry = isHighestLevel ? entry : latestMergeResult;
      const groupingValue = getGroupingVal(currentEntry, groupByKey);
      const ignoreKeys = new Set([specialKey.PREPROCESSED_GROUP_ID_KEY, measure.TOTAL_PLANNED_TIME, measure.TOTAL_PRODUCED_QTY]); // no need to merge values we are grouping by
      if (groupByKey !== TOTALS_GROUP_KEY) {
        ignoreKeys.add('rowplannedtime');
      }

      const mergeOptions = {
        ignoreKeys, primaryKeys, convertToSetKeys,
      };
      currentLevelMaps[groupByKeyIndex] = merge(currentLevelMaps[groupByKeyIndex], currentEntry, groupByKey, mergeOptions);

      latestMergeResult = currentLevelMaps[groupByKeyIndex].get(groupingValue); // jumping to parent group level we need to use latest merge result of child group level
      const isTotalRow = isLastOfTotals(groupByKey, entryIndex, sortedEntries);

      if (isLastOfGroup(currentEntry, nextEntry, groupByKeyIndex, groupByKeysReversed) || isTotalRow) {
        // at the end of processing each group apply formatting
        if (formatGroupFn) {
          const formatGroupFnParams = {
            item: {
              ...latestMergeResult,
              primaryGroupByKey: groupByKeys[1],
              currentGroupByKey: isFunction(groupByKey) ? groupByKey(currentEntry) : groupByKey,
              currentGroupByLevel: groupByKeyIndex,
            },
          };
          const formattedEntry = formatGroupFn(formatGroupFnParams);
          currentLevelMaps[groupByKeyIndex].set(groupingValue, formattedEntry);
          const groupId = formattedEntry[specialKey.PREPROCESSED_GROUP_ID_KEY];
          if (isHighestLevel && !stackLegend.has(groupId) && groupingValue !== null) {
            stackLegend.set(groupingValue, getChartLegendConfig({
              formattedEntry, groupId, requirements, cfgType: configType,
            }));
          }
        }
        if (!isHighestLevel) { // entries at highest level do not have sub-groups
          const currentItem = currentLevelMaps[groupByKeyIndex].get(groupingValue);
          // set old finalized state as parent group's children
          currentItem.groups = currentLevelMaps[groupByKeyIndex - 1];
          if (!isTotalRow) {
            // when calculating totals no need for stacks
            const { stackList, stackMax, stackCount } = mapToStackList(
              currentLevelMaps[groupByKeyIndex - 1],
              requirements.yAxis,
              { isStacked: isStacked[groupByKeyIndex], chartLegendState, hiddenGroupingValues },
            );
            currentItem.stackList = stackList;
            currentItem.stackMax = stackMax;
            currentItem.stackCount = stackCount;
            const isHidden = () => {
              const isTotal = requirements.granularity === granularityType.TOTAL;
              const noVisibleSubGroups = stackCount === 0;
              return isTotal && noVisibleSubGroups;
            };
            currentItem.hidden = isHidden();
          }
          // and reset that level's state
          currentLevelMaps[groupByKeyIndex - 1] = new Map();
        }
      } else {
        break;
      }
    }
  }
  const getGroupedEntries = () => {
    if (!groupByKeys.length || !currentLevelMaps.length) return { groups: new Map() };
    return currentLevelMaps[groupByKeys.length - 1].get(TOTALS_GROUP_KEY);
  };
  return {
    groupedEntries: getGroupedEntries(),
    stackLegend,
  };
}

export default function processReportsDataGranularity(data, configType, _requirements, _isStacked, formattingOptions, hiddenGroupingValues, chartLegendState) {
  const ret = {
    totals: {}, chartData: [], tableData: [], stackLegend: {},
  };
  if (!data || !Array.isArray(data)) return ret;
  const preProcessor = new ReportsDataPreprocessor(_requirements, configType, formattingOptions);
  const preProcessingResult = preProcessor.processEntries(data);

  const formatGroupFn = ({ item }) => createMapper({ ...item }, configType, _requirements, 0, formattingOptions).getFormatted();

  const groupingKeys = [
    getPrimaryGroupBy(configType, _requirements),
    getSecondaryGroupBy(configType, _requirements),
    getHighestLevelGroupBy(configType, _requirements),
  ].filter((key) => key !== null);
  const sortingKeys = [
    getPrimaryGroupBy(configType, _requirements),
    getSecondaryGroupBy(configType, _requirements),
    getHighestLevelGroupBySorting(configType),
  ].filter((key) => key !== null);
  const convertToSetKeys = new Set([
    'commentId',
    'commentgroupId',
    'performanceCommentId',
    'performanceCommentGroupId',
    'scrapreasonid',
    'scrapreasongroupid',
    'checklistId',
    'checklistgroupId',
    'stationId',
    'factoryId',
    'stationgroupId',
    'factoryId',
    'operatorId',
    'singleoperatorId',
    'shiftId',
    'productId',
    'productgroupId',
    'teamId',
    'positionId',
    'performancePositionId',
    'medianCheckDuration',
    'checklistpinId',
    'skuLabel',
  ]);

  const { groupedEntries, stackLegend } = groupAndMergeEntries(
    preProcessingResult,
    groupingKeys,
    sortingKeys,
    _requirements,
    configType,
    {
      formatGroupFn,
      isStacked: _isStacked,
      convertToSetKeys,
      chartLegendState: new Set(chartLegendState),
      hiddenGroupingValues: new Set(hiddenGroupingValues),
      formattingOptions,
    },
  );
  const groupsList = Array.from(groupedEntries.groups.values());
  return {
    totals: groupedEntries,
    chartData: groupsList,
    tableData: groupsList,
    stackLegend,
  };
}
