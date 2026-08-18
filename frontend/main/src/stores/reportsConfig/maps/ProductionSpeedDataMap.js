import ReportsDataMap from './ReportsDataMap';

import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

export default class ProductionSpeedDataMap extends ReportsDataMap {
  inputItemDefaults = {
    rangeKey: '',
    rangeStart: null,
    rangeEnd: null,
    factoryId: [],
    factory: [],
    stationId: [],
    station: [],
    stationgroupId: [],
    stationgroup: [],
    productId: [],
    product: [],
    productgroupId: [],
    productgroup: [],
    operator: [],
    shifttemplate: [],
    sku: [],
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['entityKey', null],
      ['isFasterThanTarget', 'isFasterThanTarget'],
      ['rangeKey', 'rangekey'],
      ['rangeStart', 'rangestart'],
      ['rangeEnd', 'rangeend'],
      ['target', 'target'],
      ['mode', 'mode'],
      ['productionTime', 'productiontime'],
      ['productionTimeDt', 'productiontime'],
      ['productionCount', 'count'],
      ['productionTimeLabel', 'productiontime'],
      ['productionCountLabel', 'count'],
      ['modeLabel', 'mode'],
      ['targetLabel', 'target'],
      ['isMarker', 'isMarker'],
      ['entityGroupName', 'entityGroupName'],
      ['containsTarget', 'containsTarget'],
      ['containsMode', 'containsMode'],
      ['unitId', 'unitid'],
      ['belowTargetCount', 'belowTargetCount'],

      ['entityName', 'rangekey'],
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],
      ['stationId', 'stationId'],
      ['location', 'stoplocation'],
      ['positionId', 'positionId'],
      ['product', 'product'],
      ['productId', 'productId'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['station', 'station'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],

      ['value', 'count'],

      ['color', null],
      ['binOrder', null],

      ['xScaleValue', this.xScaleValueKey], // used in chart date granularity calculations
      ['groupingKey', this.xScaleValueKey], // used for FE grouping

      ['measureLabel', this.xScaleValueLabelKey], // chart x axis labeling
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['isFake', 'isFake'],
      ['defined', null],
      ['noData', 'noData'],
    ]);
  }

  get formatMap() {
    return new Map([
      ['entityKey', () => 'rangekey'],
      ['value', (val) => val || 0],
      ['groupingKey', () => this.getGroupingKey()],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],
      ['valueLabel', (val) => val],
      ['color', (val, obj) => (obj.isFasterThanTarget ? colorConstants.light.primary : graphColors['graph-yellow'])],
      ['entityName', formatSetAsStr],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['location', formatSetAsStr],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
      ['entityId', formatSetOrValAsArray],
      ['productId', formatSetOrValAsArray],
      ['productGroupId', formatSetOrValAsArray],
      ['operatorId', formatSetOrValAsArray],
      ['stationId', formatSetOrValAsArray],
      ['stationGroupId', formatSetOrValAsArray],
      ['positionId', formatSetOrValAsArray],
      ['sku', formatSetAsStr],
      ['skuLabel', formatSetAsStr],
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],
      ['entityGroupName', formatSetAsStr],
      ['target', formatSetAsStr],
      ['targetLabel', (val) => this.formatNumber(formatSetAsStr(val))],
      ['mode', formatSetAsStr],
      ['modeLabel', (val) => this.formatNumber(formatSetAsStr(val))],
      ['productionTimeLabel', (val) => this.formatSecondsReadable(val)],
      ['productionCountLabel', (val) => this.formatNumber(val)],
      ['unitId', formatSetAsStr],
      ['productionTimeDt', (val) => new Date(val * 1000)],
      ['binOrder', (val, entry) => (this.groupBy[0] === xAxisKey.SECOND_PER_UNIT ? entry.rangeEnd : 1 / entry.rangeEnd)],

      ['defined', (val, obj) => !obj.isFake],
    ]);
  }

  idKeyMap = {
    default: 'rangekey',
  };

  idKeyNameKeyMap = {
    default: 'midPoint',
  };
}
