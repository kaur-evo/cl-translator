import { setActivePinia, createPinia } from 'pinia';

import getSettingsEntityConfig, {
  getReasonTranslation,
  getCommaSeparatedItems,
  getBooleanString,
  getNoteRequiredDuration,
  getMaxAllowedDuration,
  getStopType,
  getIdealCycleTime,
  getDowntimeStartTime,
  getAlternativeUnitValue,
  isScrapUnitQtyVisible,
  getCommonEntityItem,
  getOnOffString,
  getPeriodicFrequencyTypeDetails,
  getChecklistFrequencyType,
  getChecklistFrequencyDetails,
  getStopReasonFrequencyDetails,
  getShiftFrequencyDetails,
  getTaskTypeString,
  getTaskProps,
  getLineviewRestriction,
  getUserRoles,
} from './settingsLogsEntitiesConfig';

import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';
import i18n from '@/services/i18n';
import useConfigurationStore from '@/stores/configuration';
import useFactoryStore from '@/stores/factory';
import useFeatureStore from '@/stores/feature';
import useProfileStore from '@/stores/profile';
import { entities } from '@/constants/activityLogsConstants';
import { checklistTypes, periodicSubTypes, checkTypes } from '@/constants/checklistsConstants';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';

beforeEach(() => {
  setActivePinia(createPinia());

  const configurationStore = useConfigurationStore();
  configurationStore.configuration = { productBasedScrap: null };

  const factoryStore = useFactoryStore();
  factoryStore.factories = [{}]; // single factory: hasMultipleFactories = false

  const profileStore = useProfileStore();
  profileStore.currentUser = {
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 24,
    numberFormattingOptions: defaultNumberFormattingOptions,
    firstDayOfWeek: 1,
  };
  profileStore.language = 'en';

  const featureStore = useFeatureStore();
  featureStore.semiFinished = true;
});

describe('getReasonTranslation', () => {
  it('returns translated reason for "Uncommented"', () => {
    const result = getReasonTranslation('Uncommented');
    expect(result).toBe(i18n.global.t('Uncommented'));
  });

  it('returns the same reason if not "Uncommented"', () => {
    const result = getReasonTranslation('OtherReason');
    expect(result).toBe('OtherReason');
  });
});

describe('getCommaSeparatedItems', () => {
  it('returns - if count is 0 and emptyEqualsAll is false', () => {
    const items = [];
    expect(getCommaSeparatedItems(items, 0, false)).toBe('-');
  });

  it('returns All if count is 0 and emptyEqualsAll is true', () => {
    const items = [];
    expect(getCommaSeparatedItems(items, 0, true)).toBe('All');
  });

  it('returns comma separated items if items count is less than 10', () => {
    const items = [
      { id: 1, name: 'Item1' },
      { id: 2, name: 'Item2' },
      { id: 3, name: 'Item3' },
      { id: 4, name: 'Item4' },
    ];
    expect(getCommaSeparatedItems(items, 4)).toBe('Item1, Item2, Item3, Item4');
  });

  it('returns comma separated 10 items with "+ x more" if items count is more than 10', () => {
    const items = [
      { id: 1, name: 'Item1' },
      { id: 2, name: 'Item2' },
      { id: 3, name: 'Item3' },
      { id: 4, name: 'Item4' },
      { id: 5, name: 'Item5' },
      { id: 6, name: 'Item6' },
      { id: 7, name: 'Item7' },
      { id: 8, name: 'Item8' },
      { id: 9, name: 'Item9' },
      { id: 10, name: 'Item10' },
      { id: 11, name: 'Item11' },
      { id: 12, name: 'Item12' },
    ];
    expect(getCommaSeparatedItems(items, 12)).toBe('Item1, Item2, Item3, Item4, Item5, Item6, Item7, Item8, Item9, Item10 + 2 more');
  });
});

describe('getBooleanString', () => {
  it('returns "Yes" if value is true', () => {
    expect(getBooleanString(true)).toBe(i18n.global.t('Yes'));
  });

  it('returns "No" if value is false', () => {
    expect(getBooleanString(false)).toBe(i18n.global.t('No'));
  });
});

describe('getOnOffString', () => {
  it('returns "On" if value is true', () => {
    expect(getOnOffString(true)).toBe(i18n.global.t('On'));
  });

  it('returns "Off" if value is false', () => {
    expect(getOnOffString(false)).toBe(i18n.global.t('Off'));
  });
});

describe('getNoteRequiredDuration', () => {
  it('returns "No" if noteRequired is false', () => {
    expect(getNoteRequiredDuration({ noteRequired: false })).toBe(i18n.global.t('No'));
  });

  it('returns formatted duration if noteRequired is true and noteRequiredDuration is 0', () => {
    expect(getNoteRequiredDuration({ noteRequired: true, noteRequiredDuration: 0 })).toBe('0s');
  });

  it('returns formatted duration if noteRequired is true and noteRequiredDuration is more than 0', () => {
    expect(getNoteRequiredDuration({ noteRequired: true, noteRequiredDuration: 3600 })).toBe('1h');
  });
});

describe('getMaxAllowedDuration', () => {
  it('returns "No" if value is 0', () => {
    expect(getMaxAllowedDuration(0)).toBe(i18n.global.t('No'));
  });

  it('returns formatted duration if value is not 0', () => {
    expect(getMaxAllowedDuration(2765)).toBe('46m 5s');
  });
});

describe('getStopType', () => {
  it('returns "Unplanned" if value is true', () => {
    expect(getStopType(true)).toBe(i18n.global.t('Unplanned'));
  });

  it('returns "Planned" if value is false', () => {
    expect(getStopType(false)).toBe(i18n.global.t('Planned'));
  });
});

test('that getIdealCycleTime returns ideal cycle time in correct format', () => {
  expect(getIdealCycleTime({ runTime: 2, runTimeType: 'SECOND_PER_UNIT', unitId: 'unit' })).toBe('2 SECOND_PER_{unit}');
});

test('that getDowntimeStartTime returns downtime start time in correct format', () => {
  expect(getDowntimeStartTime({ cycleTimeCritical: 5, cycleTimeGood: 10 })).toBe('5 + 10 sec');
});

describe('getAlternativeUnitValue', () => {
  it('returns alternative unit value without unit if alternativeUnitId is null', () => {
    expect(getAlternativeUnitValue({
      unitConversion: 1.5, unitConversionType: 'PRIMARY_TO_ALT', unitId: 'unit', alternativeUnitId: null,
    })).toBe('1,5 unit = 1');
  });

  it('returns alternative unit value in correct format', () => {
    expect(getAlternativeUnitValue({
      unitConversion: 1.5, unitConversionType: 'PRIMARY_TO_ALT', unitId: 'unit', alternativeUnitId: 'alt_unit',
    })).toBe('1,5 unit = 1 alt_unit');
  });
});

describe('isScrapUnitQtyVisible', () => {
  it('returns false if productBasedScrapConf is null', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: null };
    expect(isScrapUnitQtyVisible(1)).toBe(false);
  });

  it('returns false if productBasedScrapConf is false', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: false };
    expect(isScrapUnitQtyVisible(1)).toBe(false);
  });

  it('returns true if productBasedScrapConf is true', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: true };
    expect(isScrapUnitQtyVisible(1)).toBe(true);
  });

  it('returns false if productBasedScrapConf is an empty array', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: [] };
    expect(isScrapUnitQtyVisible(1)).toBe(false);
  });

  it('returns false if productBasedScrapConf does not include the stationId', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: [2, 3] };
    expect(isScrapUnitQtyVisible(1)).toBe(false);
  });

  it('returns true if productBasedScrapConf includes the stationId', () => {
    const configurationStore = useConfigurationStore();
    configurationStore.configuration = { productBasedScrap: [1, 2, 3] };
    expect(isScrapUnitQtyVisible(1)).toBe(true);
  });
});

describe('getCommonEntityItem', () => {
  it('returns empty object if itemKey is not in entityItemsMap', () => {
    const result = getCommonEntityItem('unknownKey');
    expect(result).toEqual({});
  });

  it('returns correct object if itemKey is name', () => {
    const result = getCommonEntityItem('name');
    expect(result).toEqual({
      key: i18n.global.t('Name'),
    });
  });

  it('returns correct object if itemKey is groupName', () => {
    const result = getCommonEntityItem('groupName');
    expect(result).toEqual({
      key: i18n.global.t('Group name'),
    });
  });

  it('returns correct object if itemKey is group', () => {
    const result = getCommonEntityItem('group');
    expect(result).toEqual({
      key: i18n.global.t('Group'),
      value: expect.any(Function),
    });
  });

  it('returns correct object if itemKey is local', () => {
    const result = getCommonEntityItem('local');
    expect(result).toEqual({
      key: i18n.global.t('Global group'),
      value: expect.any(Function),
    });
  });

  it('returns correct object if itemKey is color', () => {
    const result = getCommonEntityItem('color');
    expect(result).toEqual({
      key: i18n.global.t('Color'),
      value: expect.any(Function),
    });
  });

  it('returns correct object if itemKey is factories', () => {
    const result = getCommonEntityItem('factories');
    expect(result).toEqual({
      key: i18n.global.t('Factories'),
      value: expect.any(Function),
      ignore: expect.any(Function),
    });
  });

  it('returns correct object if itemKey is tags', () => {
    const result = getCommonEntityItem('tags');
    expect(result).toEqual({
      key: i18n.global.t('Tags'),
      value: expect.any(Function),
    });
  });

  it('returns correct object if itemKey is stations', () => {
    const result = getCommonEntityItem('stations');
    expect(result).toEqual({
      key: i18n.global.t('Stations'),
      value: expect.any(Function),
    });
  });
});

describe('getSettingsEntityConfig', () => {
  it('returns correct config for STOP_REASON entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.STOP_REASON });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for STOP_REASON_GROUP entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.STOP_REASON_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SCRAP_REASON entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SCRAP_REASON });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SCRAP_REASON_GROUP entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SCRAP_REASON_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for PRODUCT entityType when semiFinished conf is true', () => {
    const featureStore = useFeatureStore();
    featureStore.semiFinished = true;
    const config = getSettingsEntityConfig({ entityType: entities.PRODUCT });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for PRODUCT entityType when semiFinished conf is false', () => {
    const featureStore = useFeatureStore();
    featureStore.semiFinished = false;
    const config = getSettingsEntityConfig({ entityType: entities.PRODUCT });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for PRODUCT_GROUP entityType if hasMultipleFactories conf is true', () => {
    const config = getSettingsEntityConfig({ entityType: entities.PRODUCT_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for STATION entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.STATION });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for STATION_GROUP entityType if hasMultipleFactories conf is true', () => {
    const factoryStore = useFactoryStore();
    factoryStore.factories = [{}, {}];
    const config = getSettingsEntityConfig({ entityType: entities.STATION_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for STATION_GROUP entityType if hasMultipleFactories conf is false', () => {
    const factoryStore = useFactoryStore();
    factoryStore.factories = [{}];
    const config = getSettingsEntityConfig({ entityType: entities.STATION_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for CHECKLIST_GROUP entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.CHECKLIST_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for CHECKLIST entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.CHECKLIST });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for USER entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.USER });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SPEED_LOSS entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SPEED_LOSS });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SPEED_LOSS_GORUP entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SPEED_LOSS_GROUP });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for POSITION entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.POSITION });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for OPERATOR entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.OPERATOR });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SHIFT entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SHIFT });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SECURITY entityType', () => {
    const config = getSettingsEntityConfig({ entityType: entities.SECURITY });
    expect(config).toMatchSnapshot();
  });

  describe('PRODUCT sku ignore function', () => {
    it('should ignore sku when it equals name', () => {
      const config = getSettingsEntityConfig({ entityType: entities.PRODUCT });
      const item = { name: 'TestProduct', sku: 'TestProduct' };
      expect(config.sku.ignore(item.sku, item)).toBe(true);
    });

    it('should not ignore sku when it differs from name', () => {
      const config = getSettingsEntityConfig({ entityType: entities.PRODUCT });
      const item = { name: 'TestProduct', sku: 'SKU-123' };
      expect(config.sku.ignore(item.sku, item)).toBe(false);
    });
  });

  describe('STATION changeover fields', () => {
    let config;

    beforeEach(() => {
      config = getSettingsEntityConfig({ entityType: entities.STATION });
    });

    it('should have requireChangeoverNote field with correct key and getBooleanString formatter', () => {
      expect(config.requireChangeoverNote.key).toBe(i18n.global.t('Require note on changeovers'));
      expect(config.requireChangeoverNote.value).toBe(getBooleanString);
    });

    it('should have requireLotBatch field with correct key and getBooleanString formatter', () => {
      expect(config.requireLotBatch.key).toBe(i18n.global.t('Require Lot/Batch on changeovers'));
      expect(config.requireLotBatch.value).toBe(getBooleanString);
    });
  });
});

describe('getPeriodicFrequencyTypeDetails', () => {
  it('returns correct details if subType is DAILY', () => {
    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.DAILY,
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };

    const result = getPeriodicFrequencyTypeDetails(frequency);
    expect(result).toEqual([
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
    ]);
  });

  it('returns correct details if subType is WEEKLY', () => {
    const profileStore = useProfileStore();
    profileStore.language = 'en';

    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.WEEKLY,
      repeatEvery: 2,
      days: ['MONDAY', 'TUESDAY'],
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };

    const result = getPeriodicFrequencyTypeDetails(frequency);
    expect(result).toEqual([
      { key: 'Repeat every', value: '2 weeks', persistent: true },
      { key: 'Days', value: 'Monday, Tuesday', persistent: true },
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
    ]);
  });

  it('returns correct details if subType is MONTHLY and dayOfMonth is set', () => {
    const profileStore = useProfileStore();
    profileStore.language = 'en';

    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.MONTHLY,
      repeatEvery: 3,
      dayOfMonth: 15,
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };

    const result = getPeriodicFrequencyTypeDetails(frequency);
    expect(result).toEqual([
      { key: 'Repeat every', value: '3 months', persistent: true },
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
      { key: 'On a specific calendar day', value: 15, persistent: true },
    ]);
  });

  it('returns correct details if subType is MONTHLY and occurrence and day are set', () => {
    const profileStore = useProfileStore();
    profileStore.language = 'en';

    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.MONTHLY,
      repeatEvery: 3,
      occurrence: 2,
      day: 'MONDAY',
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };

    const result = getPeriodicFrequencyTypeDetails(frequency);
    expect(result).toEqual([
      { key: 'Repeat every', value: '3 months', persistent: true },
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
      { key: 'On a specific weekday', value: 'Second_ordinal Monday', persistent: true },
    ]);
  });
});

describe('getChecklistFrequencyType', () => {
  it('returns frequency type object with value as subType if type is PERIODIC', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY };
    const result = getChecklistFrequencyType(frequency);
    expect(result).toEqual({ key: 'Type', value: 'Daily', persistent: true });
  });

  it('returns frequency type object with value as type if type is not PERIODIC', () => {
    const frequency = { type: checklistTypes.MANUAL };
    const result = getChecklistFrequencyType(frequency);
    expect(result).toEqual({ key: 'Type', value: 'Manual activation', persistent: true });
  });
});

describe('getChecklistFrequencyDetails', () => {
  it('returns correct details if type is interval', () => {
    const frequency = {
      type: checklistTypes.INTERVAL,
      intervalTime: 120,
      delayTime: 0,
      setpoint: 0,
      targetQty: 0,
      resetOnShiftStart: false,
      resetOnChangeover: true,
      pauseDuringDowntime: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: false,
    };
    const item = { frequency, startTime: '2023-10-10T10:00:00' };
    const result = getChecklistFrequencyDetails(frequency, item);
    expect(result).toEqual([
      { key: 'Type', value: 'Regular intervals', persistent: true },
      { key: 'Interval start time', value: '10.10.2023 10:00' },
      { key: 'Show every', value: '2min', persistent: true },
      { key: 'Reset at shift start', value: 'No', persistent: true },
      { key: 'Reset at product changeover', value: 'Yes', persistent: true },
      { key: 'Pause timer during downtime', value: 'No', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is changeover with interval', () => {
    const frequency = {
      type: checklistTypes.CHANGEOVER,
      intervalTime: 1200,
      delayTime: 120,
      setpoint: 0,
      targetQty: 0,
      resetOnShiftStart: false,
      resetOnChangeover: true,
      pauseDuringDowntime: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Changeover', persistent: true },
      { key: 'Show after', value: '2min', persistent: true },
      { key: 'Add interval', value: '20min', persistent: true },
      { key: 'Reset at shift start', value: 'No', persistent: true },
      { key: 'Pause timer during downtime', value: 'No', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is changeover without interval', () => {
    const frequency = {
      type: checklistTypes.CHANGEOVER,
      intervalTime: 0,
      delayTime: 120,
      setpoint: 0,
      targetQty: 0,
      resetOnShiftStart: true,
      resetOnChangeover: false,
      pauseDuringDowntime: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: true,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Changeover', persistent: true },
      { key: 'Show after', value: '2min', persistent: true },
      { key: 'Add interval', value: 'No', persistent: true },
      { key: 'Reset at shift start', value: 'Yes', persistent: true },
      { key: 'Pause timer during downtime', value: 'No', persistent: true },
      { key: 'Allow manual activation', value: 'Yes', persistent: true },
    ]);
  });

  it('returns correct details if type is changeover with leadTime', () => {
    const frequency = {
      type: checklistTypes.CHANGEOVER,
      intervalTime: 0,
      delayTime: 0,
      leadTime: 300,
      setpoint: 0,
      targetQty: 0,
      resetOnShiftStart: false,
      resetOnChangeover: false,
      pauseDuringDowntime: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Changeover', persistent: true },
      { key: 'Show before', value: '5min', persistent: true },
      { key: 'Add interval', value: 'No', persistent: true },
      { key: 'Reset at shift start', value: 'No', persistent: true },
      { key: 'Pause timer during downtime', value: 'No', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is quantity', () => {
    const frequency = {
      type: checklistTypes.QUANTITY,
      intervalTime: 0,
      delayTime: 0,
      setpoint: 0,
      targetQty: 100,
      resetOnShiftStart: false,
      resetOnChangeover: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Quantity produced', persistent: true },
      { key: 'Show every', value: '100 units', persistent: true },
      { key: 'Reset at shift start', value: 'No', persistent: true },
      { key: 'Reset at product changeover', value: 'No', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is stopreason', () => {
    const frequency = {
      type: checklistTypes.STOPREASON,
      setpoint: 0,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Downtime', persistent: true },
      { key: 'Stop reasons', value: 'All', persistent: true },
      { key: 'Stop reason', value: 'Is added', persistent: true },
      { key: 'Machine locations', value: 'All', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is PERIODIC and subType is DAILY', () => {
    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.DAILY,
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Daily', persistent: true },
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is PERIODIC and subType is WEEKLY', () => {
    const profileStore = useProfileStore();
    profileStore.language = 'en';

    const frequency = {
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.WEEKLY,
      repeatEvery: 2,
      days: ['MONDAY', 'TUESDAY'],
      times: ['08:00', '12:00'],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Weekly', persistent: true },
      { key: 'Repeat every', value: '2 weeks', persistent: true },
      { key: 'Days', value: 'Monday, Tuesday', persistent: true },
      { key: 'Show at', value: '08:00, 12:00', persistent: true },
      { key: 'Allow manual activation', value: 'No', persistent: true },
    ]);
  });

  it('returns correct details if type is shift', () => {
    const frequency = {
      type: checklistTypes.SHIFT,
      offsetFromStartSeconds: 3600,
      offsetFromEndSeconds: 1800,
      manualAllowed: true,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Shift time', persistent: true },
      { key: 'After shift start', value: '1h', persistent: true },
      { key: 'Before shift end', value: '30min', persistent: true },
      { key: 'Allow manual activation', value: 'Yes', persistent: true },
    ]);
  });

  it('returns correct details if type is manual', () => {
    const frequency = {
      type: checklistTypes.MANUAL,
      intervalTime: 0,
      delayTime: 0,
      setpoint: 0,
      targetQty: 0,
      resetOnShiftStart: false,
      resetOnChangeover: false,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
      days: [],
      times: [],
      manualAllowed: false,
    };
    const result = getChecklistFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Type', value: 'Manual activation', persistent: true },
    ]);
  });
});

describe('getStopReasonFrequencyDetails', () => {
  it('returns "Is added" if setpoint is 0', () => {
    const frequency = {
      setpoint: 0,
      stops: [],
      stopCount: 0,
      positions: [],
      positionCount: 0,
    };
    const result = getStopReasonFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Stop reasons', value: 'All', persistent: true },
      { key: 'Stop reason', value: 'Is added', persistent: true },
      { key: 'Machine locations', value: 'All', persistent: true },
    ]);
  });

  it('returns "Lasts longer than" if setpoint is greater than 0', () => {
    const frequency = {
      setpoint: 1200,
      stops: [{ id: 1, name: 'stop 1' }, { id: 2, name: 'stop 2' }],
      stopCount: 2,
      positions: [{ id: 1, name: 'position 1' }],
      positionCount: 1,
    };
    const result = getStopReasonFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Stop reasons', value: 'stop 1, stop 2', persistent: true },
      { key: 'Lasts longer than', value: '20min', persistent: true },
      { key: 'Machine locations', value: 'position 1', persistent: true },
    ]);
  });
});

describe('getShiftFrequencyDetails', () => {
  it('returns empty array if both offsets are null', () => {
    const frequency = {
      offsetFromStartSeconds: null,
      offsetFromEndSeconds: null,
    };
    const result = getShiftFrequencyDetails(frequency);
    expect(result).toEqual([]);
  });

  it('returns only "After shift start" if offsetFromEndSeconds is null', () => {
    const frequency = {
      offsetFromStartSeconds: 3660,
      offsetFromEndSeconds: null,
    };
    const result = getShiftFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'After shift start', value: '1h 1min', persistent: true },
    ]);
  });

  it('returns only "Before shift end" if offsetFromStartSeconds is null', () => {
    const frequency = {
      offsetFromStartSeconds: null,
      offsetFromEndSeconds: 120,
    };
    const result = getShiftFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'Before shift end', value: '2min', persistent: true },
    ]);
  });

  it('returns both offsets when both are set', () => {
    const frequency = {
      offsetFromStartSeconds: 3600,
      offsetFromEndSeconds: 7200,
    };
    const result = getShiftFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'After shift start', value: '1h', persistent: true },
      { key: 'Before shift end', value: '2h', persistent: true },
    ]);
  });

  it('returns 0s for zero offset values', () => {
    const frequency = {
      offsetFromStartSeconds: 0,
      offsetFromEndSeconds: 0,
    };
    const result = getShiftFrequencyDetails(frequency);
    expect(result).toEqual([
      { key: 'After shift start', value: '0s', persistent: true },
      { key: 'Before shift end', value: '0s', persistent: true },
    ]);
  });
});

describe('getTaskTypeString', () => {
  it('returns correct string for MEASUREMENT task type', () => {
    const result = getTaskTypeString({ type: checkTypes.MEASUREMENT });
    expect(result).toBe(i18n.global.t('Measurement'));
  });

  it('returns correct string for YES_NO task type', () => {
    const result = getTaskTypeString({ type: checkTypes.YES_NO });
    expect(result).toBe('Yes/No');
  });

  it('returns correct string for TEXT task type', () => {
    const result = getTaskTypeString({ type: checkTypes.TEXT });
    expect(result).toBe(i18n.global.t('Enter text'));
  });

  it('returns correct string for CHECK task type', () => {
    const result = getTaskTypeString({ type: checkTypes.CHECK });
    expect(result).toBe(i18n.global.t('Mark as done'));
  });

  it('returns correct string for SELECTION task type when multipleSelection is true', () => {
    const result = getTaskTypeString({ type: checkTypes.SELECTION, multipleSelection: true });
    expect(result).toBe(i18n.global.t('Multi-select'));
  });

  it('returns correct string for SELECTION task type when multipleSelection is false', () => {
    const result = getTaskTypeString({ type: checkTypes.SELECTION, multipleSelection: false });
    expect(result).toBe(i18n.global.t('Single-select'));
  });
});

describe('getTaskProps', () => {
  it('returns correct props if task type is MEASUREMENT and multipleSelection is false', () => {
    const task = {
      id: '2',
      type: checkTypes.MEASUREMENT,
      name: 'Measurement Task',
      description: 'This is a measurement task',
      unit: 'unit',
      minVal: 0,
      maxVal: 100,
      warningMessage: 'Warning message',
      selectionOptions: [],
      multipleSelection: false,
      notApplicableEnabled: false,
      requiredSampleCount: null,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 2', value: 'Measurement Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: 'This is a measurement task' },
      { key: 'Type', value: 'Measurement' },
      { key: 'Unit', value: 'unit', visible: true },
      { key: 'Min', value: '0', visible: true },
      { key: 'Max', value: '100', visible: true },
      { key: 'Message', value: 'Warning message', visible: true },
      { key: 'Allow "not applicable" as an option', value: 'No' },
      { key: 'Allow adding images', value: 'No' },
      { key: 'Allow multiple sample entries', value: 'No', visible: true },
      { key: 'Required sample count', value: '-', visible: true },
    ]);
  });

  it('returns correct props if task type is MEASUREMENT and multipleSelection is true', () => {
    const task = {
      id: '2',
      type: checkTypes.MEASUREMENT,
      name: 'Measurement Task',
      description: 'This is a measurement task',
      unit: 'unit',
      minVal: 0,
      maxVal: 100,
      warningMessage: 'Warning message',
      selectionOptions: [],
      multipleSelection: true,
      notApplicableEnabled: false,
      requiredSampleCount: 5,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 2', value: 'Measurement Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: 'This is a measurement task' },
      { key: 'Type', value: 'Measurement' },
      { key: 'Unit', value: 'unit', visible: true },
      { key: 'Min', value: '0', visible: true },
      { key: 'Max', value: '100', visible: true },
      { key: 'Message', value: 'Warning message', visible: true },
      { key: 'Allow "not applicable" as an option', value: 'No' },
      { key: 'Allow adding images', value: 'No' },
      { key: 'Allow multiple sample entries', value: 'Yes', visible: true },
      { key: 'Required sample count', value: 5, visible: true },
    ]);
  });

  it('returns correct props if task type is YES_NO', () => {
    const task = {
      id: '1',
      type: checkTypes.YES_NO,
      name: 'Yes/No Task',
      description: '',
      unit: '',
      minVal: 0,
      maxVal: 100,
      warningMessage: '',
      selectionOptions: [],
      multipleSelection: false,
      notApplicableEnabled: true,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 1', value: 'Yes/No Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: '-' },
      { key: 'Type', value: 'Yes/No' },
      { key: 'Message', value: '-', visible: true },
      { key: 'Allow "not applicable" as an option', value: 'Yes' },
      { key: 'Allow adding images', value: 'No' },
    ]);
  });

  it('returns correct props if task type is YES_NO with warningMessage', () => {
    const task = {
      id: '1',
      type: checkTypes.YES_NO,
      name: 'Yes/No Task',
      description: '',
      warningMessage: 'Contact supervisor immediately',
      notApplicableEnabled: true,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 1', value: 'Yes/No Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: '-' },
      { key: 'Type', value: 'Yes/No' },
      { key: 'Message', value: 'Contact supervisor immediately', visible: true },
      { key: 'Allow "not applicable" as an option', value: 'Yes' },
      { key: 'Allow adding images', value: 'No' },
    ]);
  });

  it('returns correct props if task type is TEXT', () => {
    const task = {
      id: '10',
      type: checkTypes.TEXT,
      name: 'Text Task',
      description: '',
      unit: '',
      minVal: 0,
      maxVal: 0,
      warningMessage: '',
      selectionOptions: [],
      multipleSelection: false,
      notApplicableEnabled: true,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 10', value: 'Text Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: '-' },
      { key: 'Type', value: 'Enter text' },
      { key: 'Allow "not applicable" as an option', value: 'Yes' },
      { key: 'Allow adding images', value: 'No' },
    ]);
  });

  it('returns correct props if task type is CHECK', () => {
    const task = {
      id: '0',
      type: checkTypes.CHECK,
      name: 'Check Task',
      description: 'with description',
      unit: '',
      minVal: 0,
      maxVal: 0,
      warningMessage: '',
      selectionOptions: [],
      multipleSelection: false,
      notApplicableEnabled: false,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 0', value: 'Check Task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: 'with description' },
      { key: 'Type', value: 'Mark as done' },
      { key: 'Allow "not applicable" as an option', value: 'No' },
      { key: 'Allow adding images', value: 'No' },
    ]);
  });

  it('returns correct props if task type is SELECTION', () => {
    const task = {
      id: '1000',
      type: checkTypes.SELECTION,
      name: 'Selection task',
      description: '',
      unit: '',
      minVal: 0,
      maxVal: 0,
      warningMessage: '',
      selectionOptions: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
      multipleSelection: true,
      notApplicableEnabled: false,
    };
    const result = getTaskProps(task);
    expect(result).toEqual([
      { key: 'Task 1000', value: 'Selection task', keyClass: 'font-weight-medium' },
      { key: 'Description', value: '-' },
      { key: 'Type', value: 'Multi-select' },
      { key: 'Options', value: 'one, two, three', visible: true },
      { key: 'Allow "not applicable" as an option', value: 'No' },
      { key: 'Allow adding images', value: 'No' },
    ]);
  });

  it('includes "Allow adding images" field with value "Yes" when attachmentsEnabled is true', () => {
    const task = {
      id: 1,
      name: 'Test Task',
      type: checkTypes.TEXT,
      description: 'Test description',
      notApplicableEnabled: false,
      attachmentsEnabled: true,
    };
    const result = getTaskProps(task);
    const attachmentsField = result.find((prop) => prop.key === 'Allow adding images');
    expect(attachmentsField).toBeDefined();
    expect(attachmentsField.value).toBe('Yes');
  });

  it('includes "Allow adding images" field with value "No" when attachmentsEnabled is false or undefined (backward compatibility)', () => {
    const taskUndefined = {
      id: 1,
      name: 'Test Task',
      type: checkTypes.TEXT,
      description: 'Test description',
      notApplicableEnabled: false,
    };
    const taskFalse = {
      id: 2,
      name: 'Test Task 2',
      type: checkTypes.TEXT,
      description: 'Test description',
      notApplicableEnabled: false,
      attachmentsEnabled: false,
    };
    const resultUndefined = getTaskProps(taskUndefined);
    const resultFalse = getTaskProps(taskFalse);
    const attachmentsFieldUndefined = resultUndefined.find((prop) => prop.key === 'Allow adding images');
    const attachmentsFieldFalse = resultFalse.find((prop) => prop.key === 'Allow adding images');
    expect(attachmentsFieldUndefined).toBeDefined();
    expect(attachmentsFieldUndefined.value).toBe('No');
    expect(attachmentsFieldFalse).toBeDefined();
    expect(attachmentsFieldFalse.value).toBe('No');
  });
});

describe('getLineviewRestriction', () => {
  it('returns No if val is 0', () => {
    expect(getLineviewRestriction(0, DAYS)).toBe(i18n.global.t('No'));
    expect(getLineviewRestriction(0, SHIFTS)).toBe(i18n.global.t('No'));
  });

  it('returns formatted value if val is not 0', () => {
    expect(getLineviewRestriction(2, DAYS)).toBe('2 Days');
    expect(getLineviewRestriction(3, SHIFTS)).toBe('3 Shifts');
  });
});

describe('getUserRoles', () => {
  it('returns null if val and compareVal are equal', () => {
    const val = { name: 'role1', factories: [], factoryCount: 0 };
    const compareVal = { name: 'role1', factories: [], factoryCount: 0 };
    expect(getUserRoles(val, {}, compareVal)).toBe(null);
  });

  it('returns correct value for COMPANY_ADMIN', () => {
    const val = [{
      name: 'COMPANY_ADMIN',
      factories: [],
      factoryCount: 0,
      stations: [],
      stationCount: 0,
      lineviewTimeRestrictionType: null,
      lineviewTimeRestrictionValue: 0,
    }];
    expect(getUserRoles(val)).toEqual([
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'COMPANY_ADMIN', persistent: false,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'All', persistent: false,
      },
      {
        key: 'Stations', keyClass: 'font-weight-medium', value: 'All', persistent: false,
      },
    ]);
  });

  it('returns correct value for FACTORY_ADMIN', () => {
    const val = [{
      name: 'FACTORY_ADMIN',
      factories: [{ id: 3, name: 'Tehas 1' }],
      factoryCount: 1,
      stations: [],
      stationCount: 0,
      lineviewTimeRestrictionType: null,
      lineviewTimeRestrictionValue: 0,
    }];
    expect(getUserRoles(val)).toEqual([
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'FACTORY_ADMIN', persistent: false,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'Tehas 1', persistent: false,
      },
      {
        key: 'Stations', keyClass: 'font-weight-medium', value: 'All', persistent: false,
      },
    ]);
  });

  it('returns correct value for FACTORY_ADMIN + OFFICE USER', () => {
    const val = [
      {
        name: 'OFFICE_USER',
        factories: [
          {
            id: 1,
            name: 'Tehas 2',
          },
          {
            id: 7,
            name: 'Tehas 3',
          },
        ],
        factoryCount: 2,
        stations: [
          {
            id: 1,
            name: 'Evocon production line T2',
            writeAccess: true,
          },
          {
            id: 3,
            name: 'Pakendamine 2',
            writeAccess: false,
          },
          {
            id: 4,
            name: 'Evocon production line T2-1',
            writeAccess: false,
          },
          {
            id: 5,
            name: 'Sorteerimine 2',
            writeAccess: false,
          },
          {
            id: 75,
            name: 'Empty Station T2',
            writeAccess: false,
          },
          {
            id: 76,
            name: 'Empty Station 2',
            writeAccess: true,
          },
          {
            id: 78,
            name: 'ScrapTest T2',
            writeAccess: false,
          },
          {
            id: 80,
            name: 'Toronto TZ',
            writeAccess: false,
          },
          {
            id: 81,
            name: 'Mexico TimeZone',
            writeAccess: false,
          },
          {
            id: 61,
            name: 'India TZ',
            writeAccess: false,
          },
          {
            id: 62,
            name: 'London TZ',
            writeAccess: false,
          },
          {
            id: 63,
            name: 'Los Angeles TZ',
            writeAccess: true,
          },
        ],
        stationCount: 11,
        lineviewTimeRestrictionType: DAYS,
        lineviewTimeRestrictionValue: 0,
      },
      {
        name: 'FACTORY_ADMIN',
        factories: [
          {
            id: 3,
            name: 'Tehas 1',
          },
          {
            id: 29,
            name: 'Tehas 10',
          },
        ],
        factoryCount: 2,
        stations: [],
        stationCount: 0,
        lineviewTimeRestrictionType: null,
        lineviewTimeRestrictionValue: 0,
      },
    ];
    expect(getUserRoles(val)).toEqual([
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'OFFICE_USER', persistent: true,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'Tehas 2, Tehas 3', persistent: true,
      },
      {
        key: 'Stations',
        keyClass: 'font-weight-medium',
        value: 'Evocon production line T2 (Read & Write), Pakendamine 2 (Read-only), Evocon production line T2-1 (Read-only), Sorteerimine 2 (Read-only), Empty Station T2 (Read-only), Empty Station 2 (Read & Write), ScrapTest T2 (Read-only), Toronto TZ (Read-only), Mexico TimeZone (Read-only), India TZ (Read-only) + 2 more',
        persistent: true,
      },
      {
        key: 'Time restriction for changing data', keyClass: 'font-weight-medium', value: 'No', hidden: false, persistent: true,
      },
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'FACTORY_ADMIN', persistent: true,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'Tehas 1, Tehas 10', persistent: true,
      },
      {
        key: 'Stations', keyClass: 'font-weight-medium', value: 'All', persistent: true,
      },
    ]);
  });

  it('returns correct value for OFFICE_USER', () => {
    const val = [
      {
        name: 'OFFICE_USER',
        factories: [
          {
            id: 13,
            name: 'Tehas 6',
          },
        ],
        factoryCount: 1,
        stations: [
          {
            id: 108,
            name: 'Model Station',
            writeAccess: true,
          },
          {
            id: 77,
            name: 'another test',
            writeAccess: false,
          },
        ],
        stationCount: 2,
        lineviewTimeRestrictionType: DAYS,
        lineviewTimeRestrictionValue: 3,
      },
    ];
    expect(getUserRoles(val)).toEqual([
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'OFFICE_USER', persistent: false,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'Tehas 6', persistent: false,
      },
      {
        key: 'Stations', keyClass: 'font-weight-medium', value: 'Model Station (Read & Write), another test (Read-only)', persistent: false,
      },
      {
        key: 'Time restriction for changing data', keyClass: 'font-weight-medium', value: '3 Days', hidden: false, persistent: false,
      },
    ]);
  });

  it('returns correct value for LINEVIEW_USER', () => {
    const val = [
      {
        name: 'LINEVIEW_USER',
        factories: [
          {
            id: 29,
            name: 'Tehas 10',
          },
        ],
        factoryCount: 1,
        stations: [
          {
            id: 85,
            name: 'station 1',
            writeAccess: false,
          },
        ],
        stationCount: 1,
        lineviewTimeRestrictionType: DAYS,
        lineviewTimeRestrictionValue: 0,
      },
    ];
    expect(getUserRoles(val)).toEqual([
      {
        key: 'Role', keyClass: 'font-weight-medium', value: 'LINEVIEW_USER', persistent: false,
      },
      {
        key: 'Factories', keyClass: 'font-weight-medium', value: 'Tehas 10', persistent: false,
      },
      {
        key: 'Stations', keyClass: 'font-weight-medium', value: 'station 1 (Read-only)', persistent: false,
      },
      {
        key: 'Time restriction for changing data', keyClass: 'font-weight-medium', value: 'No', hidden: false, persistent: false,
      },
    ]);
  });
});
