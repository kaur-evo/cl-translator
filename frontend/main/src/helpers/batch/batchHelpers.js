import { isSameDay } from 'date-fns';

import parseDateStr from '../date/parseDateStr';

import { formatTime } from '@/helpers/time/formatTime';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import i18n from '@/services/i18n';
import { formatDate } from '@/helpers/date/formatDate';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import { useConfigurationStore } from '@/stores';


export const getBatchTitle = (batch) => {
  const productName = batch.productName || '';
  if (batch.productSku && batch.productSku === productName) return productName;
  return productName + (batch.productSku ? ` (${batch.productSku})` : '');
};

const isScrapUnitQtyVisible = (stationId) => {
  const productBasedScrap = useConfigurationStore().configuration?.productBasedScrap;
  if (Array.isArray(productBasedScrap)) return productBasedScrap.includes(stationId);
  return productBasedScrap ?? false;
};

export const getBatchTooltipRows = (batch, shiftDate) => {
  const unitId = getUnitId(batch);
  const unitQty = altUnitConversion(batch, batch.unitQty);
  const plannedQty = altUnitConversion(batch, batch.plannedQty);
  const scrapUnitQty = altUnitConversion(batch, batch.scrapUnitQty);
  const showDate = shiftDate && !isSameDay(parseDateStr(shiftDate), new Date(batch.startTime));
  const startValue = showDate ? `${formatTime(batch.startTime)} - ${formatDate(batch.startTime, 'long')}` : formatTime(batch.startTime);
  return [
    { key: i18n.global.t('Start'), value: startValue },
    { key: i18n.global.t('Order'), value: batch.productionOrder },
    { key: i18n.global.t('Quantity per signal'), value: `${formatNumber(unitQty, { decimalPlaces: null })} ${unitId}` },
    { key: i18n.global.t('Target'), value: `${formatNumber(plannedQty, { decimalPlaces: null })} ${unitId}` },
    { key: i18n.global.t('Scrap per one signal'), value: isScrapUnitQtyVisible(batch.stationId) ? `${formatNumber(scrapUnitQty, { decimalPlaces: null })} ${unitId}` : null },
    { key: i18n.global.t('Setup time'), value: batch.productionOrderSetupTime },
    { key: i18n.global.t('LOT/Batch'), value: batch.lotCode },
    { key: i18n.global.t('Comment'), value: batch.productionOrderNote, allowTextWrap: true },
    { key: i18n.global.t('Extra note'), value: batch.notes, allowTextWrap: true },
  ];
};

export const formatBatchTargetDisplay = (batch) => {
  const unitId = getUnitId(batch);
  const plannedQty = altUnitConversion(batch, batch.plannedQty);
  return plannedQty ? `${formatNumber(plannedQty, { decimalPlaces: null })} ${unitId}` : '';
};

export const formatBatchEstimatedTime = (batch) => {
  if (!batch.estimatedTimeLeft) return '';
  return formatSecondsFriendly(batch.estimatedTimeLeft);
};

export const getBatchCardTitle = (batch) => {
  const label = batch.productionOrder || batch.productName;
  return `${formatTime(batch.startTime)} — ${formatDate(batch.startTime, 'long')} — ${label}`;
};

export const getBatchQuantityParts = (batch, preferAltUnit) => {
  const unitId = getUnitId(batch, preferAltUnit);
  const goodQty = formatNumber(altUnitConversion(batch, batch.producedQty - batch.scrapQty, preferAltUnit));
  const scrapQty = batch.scrapQty ? formatNumber(altUnitConversion(batch, batch.scrapQty, preferAltUnit)) : '';
  const plannedQty = batch.plannedQty ? formatNumber(altUnitConversion(batch, batch.plannedQty, preferAltUnit), { decimalPlaces: null }) : '';
  return { goodQty, scrapQty, plannedQty, unitId };
};
