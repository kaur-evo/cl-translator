import { isArray } from 'lodash';

import EmptyDates from '@/stores/reportsConfig/mappers/EmptyDatesMapper';
import getPreProcessingConfig from '@/stores/reportsConfig/configurations/preProcessingConfig';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import deleteObjKeys from '@/helpers/object/deleteObjKeys';
import remapObjKeys from '@/helpers/object/remapObjKeys';
import calcObjKeys from '@/helpers/object/calcObjKeys';

export default class ReportsDataPreprocessor {
  config = null;

  constructor(requirements, configType, formattingOptions) {
    const preProcessingConfig = getPreProcessingConfig({ formattingOptions, requirements });
    if (preProcessingConfig.has(configType)) {
      this.config = preProcessingConfig.get(configType);
    }
    this.formattingOptions = formattingOptions ?? {};
    this.requirements = requirements;
  }

  buildPreprocessedEntries(list, entry) {
    const listCopy = [...list];
    this.config.groupingConfig.forEach((configGroup, groupName) => {
      let entryCopy = { ...entry };
      entryCopy[specialKey.PREPROCESSED_GROUP_ID_KEY] = groupName;
      entryCopy[specialKey.PREPROCESSED_ORDER_KEY] = configGroup.order;
      entryCopy = remapObjKeys(entryCopy, configGroup.mapKeys);
      entryCopy = deleteObjKeys(entryCopy, configGroup.deleteKeys);
      entryCopy = { ...entryCopy, ...configGroup.overwrite };
      listCopy.push(entryCopy);
    });
    return listCopy;
  }

  getPlaceholderEntriesMap() {
    const { granularity, startDate, endDate } = this.requirements;

    if (granularity !== granularityType.TOTAL) {
      const weekStartsOn = this.formattingOptions.firstDayOfWeek;
      const emptyDates = new EmptyDates({
        startDate, endDate, granularity, weekStartsOn,
      });
      return emptyDates.reduceToMap((obj) => ({ ...obj, isFake: true }));
    }
    return new Map();
  }

  processEntry = (resultsList, entryObj, calendarTimeSec) => {
    if (this.config === null) return [...resultsList, entryObj];
    let entryCopy = { ...entryObj };
    entryCopy[specialKey.CALENDAR_TIME_SEC] = calendarTimeSec;
    if (this.config.deleteKeys && this.config.deleteKeys.length > 0) {
      entryCopy = deleteObjKeys(entryCopy, this.config.deleteKeys);
    }
    if (this.config.calculateKeys && this.config.calculateKeys.size > 0) {
      entryCopy = calcObjKeys(entryCopy, this.config.calculateKeys);
    }
    if (this.config.groupingConfig && this.config.groupingConfig.size > 0) {
      return this.buildPreprocessedEntries(resultsList, entryCopy);
    }
    return [...resultsList, entryCopy];
  };

  processEntries(entries) {
    const { granularity } = this.requirements;
    const placeholderEntriesMap = this.getPlaceholderEntriesMap(this.requirements);
    const calendarTimeSec = this.requirements.calendarTimeSec / (placeholderEntriesMap.size || 1);

    const realEntriesList = entries.reduce((resultsList, entryObj) => {
      if (entryObj[granularity] !== undefined) {
        if (isArray(entryObj[granularity])) {
          if (entryObj[granularity].length > 1) throw new Error('Only one key is supported for grouping');
          placeholderEntriesMap.delete(entryObj[granularity][0]);
        } else {
          placeholderEntriesMap.delete(entryObj[granularity]);
        }
      }

      return this.processEntry(resultsList, entryObj, calendarTimeSec);
    }, []);

    const placeholderEntriesList = Array.from(placeholderEntriesMap.values()).reduce(this.processEntry, []);
    return [...realEntriesList, ...placeholderEntriesList];
  }
}
