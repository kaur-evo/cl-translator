import { DateTime } from 'luxon';

import { getUnitQty, getUnitQtyId } from '@/helpers/timeline/altUnitConversionRaw';
import sliceType from '@/constants/sliceType';
import performanceWidgetType from '@/constants/performanceWidgetType';
import { RANDOM_BIG_NUMBER } from '@/constants/randomNumber';
export const highIsGoodTypes = new Set([performanceWidgetType.UNIT_PER_MINUTE, performanceWidgetType.UNIT_PER_SECOND, performanceWidgetType.UNIT_PER_HOUR]);
export const lowIsGoodTypes = new Set([performanceWidgetType.SECOND_PER_SIGNAL, performanceWidgetType.SECOND_PER_UNIT]);
export default function processPerformanceChartData({
  timeline,
  useConversion,
  timeFormattingOptions,
  colors,
  currentBatch,
  batches,
  perfWidgetType,
  zoneId,
}) {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  return timeline.map((slice) => {
    const sliceBatch = batches.get(slice.batchId) || currentBatch;
    const unitId = getUnitQtyId(sliceBatch, sliceBatch.alternativeUnitId && useConversion);
    const quantity = getUnitQty(sliceBatch, slice.quantity, sliceBatch.alternativeUnitId && useConversion);
    const cycleTimeGood = slice.cycleTimeGood || sliceBatch.cycleTimeGood;
    let value;
    let target;
    let valueExclDowntime;
    if (perfWidgetType === performanceWidgetType.SECOND_PER_SIGNAL) {
      value = slice.type === sliceType.PRODUCT ? slice.duration / (slice.signalQty || 1) : RANDOM_BIG_NUMBER;
      valueExclDowntime = slice.type === sliceType.PRODUCT ? slice.duration / (slice.signalQty || 1) : null;
      target = cycleTimeGood * (slice.unitQty || 1);
    } else if (perfWidgetType === performanceWidgetType.SECOND_PER_UNIT) {
      value = slice.type === sliceType.PRODUCT ? slice.duration / (quantity || 1) : RANDOM_BIG_NUMBER;
      valueExclDowntime = slice.type === sliceType.PRODUCT ? slice.duration / (quantity || 1) : null;
      target = cycleTimeGood;
    } else if (perfWidgetType === performanceWidgetType.UNIT_PER_MINUTE) {
      value = slice.type === sliceType.PRODUCT ? quantity / (slice.duration / 60) || 0 : null;
      valueExclDowntime = value;
      target = getUnitQty(sliceBatch, 60 / cycleTimeGood, sliceBatch.alternativeUnitId && useConversion);
    } else if (perfWidgetType === performanceWidgetType.UNIT_PER_SECOND) {
      value = slice.type === sliceType.PRODUCT ? quantity / (slice.duration) || 0 : null;
      valueExclDowntime = value;
      target = getUnitQty(sliceBatch, 1 / cycleTimeGood, sliceBatch.alternativeUnitId && useConversion);
    } else if (perfWidgetType === performanceWidgetType.UNIT_PER_HOUR) {
      value = slice.type === sliceType.PRODUCT ? quantity / (slice.duration / 3600) || 0 : null;
      valueExclDowntime = value;
      target = getUnitQty(sliceBatch, 3600 / cycleTimeGood, sliceBatch.alternativeUnitId && useConversion);
    } else {
      throw new Error('Invalid yAxisMode: ', perfWidgetType);
    }
    const isStoppage = slice.type === sliceType.STOPPAGE;
    const isStandby = slice.type === sliceType.STANDBY;

    let dotColor;
    if (isStoppage) {
      dotColor = '#F50B0B';
    } else if (isStandby) {
      dotColor = colors['lw-gray'];
    } else if (lowIsGoodTypes.has(perfWidgetType) && value > target) {
      dotColor = colors['lw-yellow'];
    } else if (highIsGoodTypes.has(perfWidgetType) && value < target) {
      dotColor = colors['lw-yellow'];
    } else {
      dotColor = colors.white;
    }
    const newSlice = {
      value,
      target,
      dotColor,
      measureLabel: `${
        DateTime.fromISO(slice.sliceStartTmISO, { zone: zoneId }).toFormat(timeFormattingOptions.luxonLong)
      } - ${
        DateTime.fromISO(slice.sliceEndTmISO, { zone: zoneId }).toFormat(timeFormattingOptions.luxonLong)
      }`,
      yellowClipZero: isStoppage || isStandby ? target : 0,
      // clip yellow above target but also from standbys and stoppages
      measure: new Date(slice.sliceStartTmISO),
      endTime: new Date(slice.sliceEndTmISO),
      sliceEndTmISO: slice.sliceEndTmISO,
      type: slice.type,
      productName: sliceBatch.productName,
      aboveTargetValue: target < value ? value : target,
      belowTargetValue: target > value ? value : target,
      zero: 0,
      isStoppage,
      isStandby,
      notStoppage: !isStoppage,
      isProductChange: slice.isProductChange,
      unitId,
      valueExclDowntime,
    };
    return newSlice;
  }, []);
}
