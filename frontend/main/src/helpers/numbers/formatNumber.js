import formatNumberWithOptions from './formatNumberWithOptions';

import useProfileStore from '@/stores/profile';

export function formatNumber(number, options = {}, intlOptions = {}) {
  const profileStore = useProfileStore();
  return formatNumberWithOptions(number, { ...profileStore.numberFormattingOptions, ...options }, intlOptions);
}

export function formatPercentage(number, options = {}, intlOptions = {}) {
  const profileStore = useProfileStore();
  const defaultOptions = { ...profileStore.numberFormattingOptions };
  const optionsWithOverrides = { ...defaultOptions, ...options };
  optionsWithOverrides.decimalPlaces = optionsWithOverrides.pctDecimalPlaces; // use pctDecimalPlaces for percentages
  return `${formatNumberWithOptions(number, optionsWithOverrides, intlOptions)}%`;
}
