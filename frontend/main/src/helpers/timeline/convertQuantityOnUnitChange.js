import { round } from 'lodash';

import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

export function convertQuantityOnUnitChange(currentQty, currentUnitId, newUnitId, batch) {
  if (!currentQty || currentUnitId === newUnitId) {
    return currentQty;
  }

  const conversionFactor = getBatchMainToAltUnitConversion(batch);
  const isChangingToAlt = newUnitId === batch.alternativeUnitId;

  const convertedQty = isChangingToAlt ? currentQty * conversionFactor : currentQty / conversionFactor;
  return round(convertedQty, 2);
}
