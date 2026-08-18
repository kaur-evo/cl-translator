export const getBatchMainToAltUnitConversion = (batch) => {
  if (!batch.unitConversion) return 1;
  if (!batch.unitConversionType) return 1;
  return batch.unitConversionType === 'PRIMARY_TO_ALT' ? (1 / batch.unitConversion) : batch.unitConversion;
};
