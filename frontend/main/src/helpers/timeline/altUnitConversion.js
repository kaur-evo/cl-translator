import useUserPreferencesStore from '@/stores/userPreferences';
import { getUnitQty, getUnitQtyId } from '@/helpers/timeline/altUnitConversionRaw';

export const useAlternativeUnit = (batch, preferAltUnit) => {
  if (preferAltUnit === false) return false;
  const userPreferencesStore = useUserPreferencesStore();
  return !!batch.alternativeUnitId && (preferAltUnit || !userPreferencesStore.viewSettings.usePrimaryUnit);
};

export function altUnitConversion(batch, qty, preferAltUnit) {
  return getUnitQty(batch, qty, useAlternativeUnit(batch, preferAltUnit));
}

export function getUnitId(batch, preferAltUnit) {
  return getUnitQtyId(batch, useAlternativeUnit(batch, preferAltUnit));
}
