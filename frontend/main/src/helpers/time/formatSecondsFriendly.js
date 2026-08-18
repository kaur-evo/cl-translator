import formatSecondsFriendlyWithOptions from './formatSecondsFriendlyWithOptions';

import useProfileStore from '@/stores/profile';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';

const formatSecondsFriendly = (timeInSecs, showSecondIfZero = true, usePadFunc = false, shortenedMinutes = 'm') => {
  const profileStore = useProfileStore();
  const options = profileStore.numberFormattingOptions ?? defaultNumberFormattingOptions;
  return formatSecondsFriendlyWithOptions(timeInSecs, showSecondIfZero, usePadFunc, shortenedMinutes, { hourFormatOptions: options });
};

export default formatSecondsFriendly;
