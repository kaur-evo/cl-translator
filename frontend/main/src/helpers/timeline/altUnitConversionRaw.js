import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

export function getUnitQty(batch, qty, useConversion) {
  return useConversion ? qty * getBatchMainToAltUnitConversion(batch) : qty;
}

export function getUnitQtyId(batch, useConversion) {
  return useConversion ? batch.alternativeUnitId : batch.unitId;
}
