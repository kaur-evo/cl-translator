import { formatNumber } from '@/helpers/numbers/formatNumber';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import { durationFormats } from '@/constants/durationFormat';

export default function formatSecDuration(val, formatType = durationFormats.READABLE, options = {}) {
  if (durationFormats[formatType] === undefined) throw new Error(`invalid duration format type "${formatType}"`);
  if (Number.isNaN(val)) return '';

  let formatted = val;
  const suffix = '';
  const formatMap = {
    [durationFormats.READABLE]: (s) => formatSecondsFriendly(s, true, true, 'm'),
    [durationFormats.SECONDS]: (s) => formatNumber(s, options, { style: 'unit', unit: 'second' }),
    [durationFormats.MINUTES]: (s) => formatNumber(s / 60, options, { style: 'unit', unit: 'minute' }),
    [durationFormats.HOURS]: (s) => formatNumber(s / 60 / 60, options, { style: 'unit', unit: 'hour' }),
  };
  if (formatMap[formatType]) {
    formatted = formatMap[formatType](val);
  }
  return `${formatted}${suffix}`;
}
