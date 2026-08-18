export function getSelectedBatchUnits(batch) {
  if (!batch) return [];
  const mainUnit = { name: batch.unitId, id: batch.unitId };
  return [mainUnit, { name: batch.alternativeUnitId, id: batch.alternativeUnitId }].filter((unit) => unit.id);
}
