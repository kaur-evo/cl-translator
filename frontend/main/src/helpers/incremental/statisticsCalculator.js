import { DateTime } from 'luxon';

import { splitSliceByHours } from '@/helpers/timelineUtils';

const getDefaultStats = () => ({
  quantity: 0,
  scrapQty: 0,
  standByTime: 0,
  totalTime: 0,
  productionTime: 0,
  delaysCount: 0,
  delaysTime: 0,
  idealQty: 0,
  productIdealQty: 0,
  quantityAlt: 0,
  scrapAltQty: 0,
  idealAltQty: 0,
});

// eslint-disable-next-line sonarjs/cognitive-complexity
const mergeSlice = (prevSlice, slice, options) => {
  const accu = { ...prevSlice };
  if (slice.type === 'PRODUCT') {
    if (!slice.isFake) {
      accu.quantity += (slice.quantity || 0) * options.hourMultiplier;
      accu.quantityAlt += (slice.quantityAlt || 0) * options.hourMultiplier;
      accu.scrapQty += (slice.scrapQty || 0) * options.hourMultiplier;
      accu.scrapAltQty += (slice.scrapAltQty || 0) * options.hourMultiplier;
      accu.productionTime += slice.duration * options.hourMultiplier;
      accu.productIdealQty += slice.idealQty * options.hourMultiplier;
    }
    accu.idealQty += slice.idealQty * options.hourMultiplier;
    accu.idealAltQty += slice.idealAltQty * options.hourMultiplier;
  } else {
    const elementIdealQty = slice.idealQty || slice.idealQty === 0 ? slice.idealQty : (slice.duration / slice.cycleTimeGood);
    accu.idealQty += (slice.includeInOee ? elementIdealQty : 0) * options.hourMultiplier;
    accu.idealAltQty += (slice.includeInOee ? slice.idealAltQty : 0) * options.hourMultiplier;
    accu.standByTime += (slice.includeInOee ? 0 : slice.duration) * options.hourMultiplier;
    accu.delaysCount += (slice.type === 'STOPPAGE' && slice.commentId === 0) ? 1 : 0;
    accu.delaysTime += (slice.type === 'STOPPAGE' ? slice.duration : 0) * options.hourMultiplier;
  }
  accu.totalTime += slice.duration * options.hourMultiplier;

  return accu;
};

const calculateTotals = (timeline, now, timezone) => {
  let shiftStats = getDefaultStats();
  const hourStats = {};
  timeline.forEach((slice) => {
    const sliceByHours = splitSliceByHours(slice, timezone);

    sliceByHours.forEach((el) => {
      const hourMultiplier = sliceByHours.length === 1 ? 1 : el.elementDuration / el.parent.duration;
      if (hourStats[el.hourStart] === undefined) hourStats[el.hourStart] = getDefaultStats();
      hourStats[el.hourStart] = {
        ...mergeSlice(hourStats[el.hourStart], el.parent, {
          timezone, now, hourMultiplier,
        }),
        dateTime: el.hourStart,
      };
    });
    shiftStats = mergeSlice(shiftStats, slice, {
      timezone, now, hourMultiplier: 1,
    });
  });
  return { shiftStats, hourStats };
};

const getAvailability = (shiftTotals) => (shiftTotals.productionTime / (shiftTotals.totalTime - shiftTotals.standByTime)) || 0;

const getPerformance = (shiftTotals) => (shiftTotals.quantity / shiftTotals.productIdealQty) || 0;

const getQuality = (shiftTotals) => ((shiftTotals.quantity - shiftTotals.scrapQty) / shiftTotals.quantity) || 0;

const getStats = (totals) => {
  if (!totals) return {};
  const availability = getAvailability(totals);
  const performance = getPerformance(totals);
  const quality = getQuality(totals);

  return {
    ...totals,
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
  };
};

const calculateStatistics = (timeline, zoneId, shift) => {
  const now = DateTime.local().setZone(zoneId);
  const runningHour = now.startOf('hour').toISO();

  const { shiftStats, hourStats } = calculateTotals(timeline, now, zoneId);

  const shiftStatistics = getStats(shiftStats);

  const statistics = {
    delaysCount: shiftStatistics.delaysCount,
    shiftTotal: shiftStatistics,
    hourStatistics: {
      ...shift.statisticsRaw?.hourStatistics,
      [runningHour]: getStats(hourStats[runningHour]),
    },
  };
  return { statistics, shift };
};

export {
  calculateStatistics,
  getAvailability,
  getPerformance,
  getQuality,
  calculateTotals,
  getStats,
};
