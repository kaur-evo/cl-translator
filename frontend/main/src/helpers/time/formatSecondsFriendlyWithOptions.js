import formatNumberWithOptions from '@/helpers/numbers/formatNumberWithOptions';

const getSecondsFormatted = (val, pad) => {
  const seconds = val >= 60 ? val % 60 : val;
  const secondsRounded = Math.round(seconds);
  if (pad) {
    return `${String(secondsRounded).padStart(2, '0')}s`;
  }
  return `${String(secondsRounded)}s`;
};

const getMinutesFormatted = (val, pad, minutesString = 'm') => {
  const minutes = val < 3600 ? Math.floor(val / 60) : Math.floor((val % 3600) / 60);
  const res = pad ? String(minutes).padStart(2, '0') : minutes;
  return `${res}${minutesString}`;
};

const getHoursFormatted = (val, options) => `${formatNumberWithOptions(Math.floor(val / 3600), options)}h`;

export default function formatSecondsFriendlyWithOptions(timeInSecs, showSecondIfZero = true, usePadFunc = false, shortenedMinutes = 'm', { hourFormatOptions } = {}) {
  let char = '';
  let value = timeInSecs;
  if (timeInSecs < 0) {
    char = '-';
    value = Math.abs(timeInSecs);
  }
  if (value < 60) {
    return getSecondsFormatted(value);
  }
  if (value < 3600) {
    if (value % 60 === 0 && !showSecondIfZero) {
      return `${char}${getMinutesFormatted(value, usePadFunc, shortenedMinutes)}`;
    }
    return `${char}${getMinutesFormatted(value, usePadFunc, shortenedMinutes)} ${getSecondsFormatted(value, usePadFunc)}`;
  }
  if (Math.floor((value % 3600) / 60) === 0 && !showSecondIfZero) {
    return `${char}${getHoursFormatted(value, hourFormatOptions)}`;
  }
  if (usePadFunc) {
    return `${char}${getHoursFormatted(value, hourFormatOptions)} ${getMinutesFormatted(value, usePadFunc, shortenedMinutes)} ${getSecondsFormatted(value, true)}`;
  }
  return `${char}${getHoursFormatted(value, hourFormatOptions)} ${getMinutesFormatted(value, usePadFunc, shortenedMinutes)}`;
}
