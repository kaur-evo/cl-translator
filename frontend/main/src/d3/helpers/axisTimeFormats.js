import * as d3 from 'd3';
import { DateTime } from 'luxon';

import useProfileStore from '@/stores/profile';
import { timeFormats } from '@/constants/formattingConstants';

export const getHourFormat = () => {
  const profileStore = useProfileStore();
  const { timeFormat } = profileStore.currentUser;
  return timeFormat === timeFormats['12H']
    ? d3.timeFormat('%I:%M%p') // hour (12-hour clock) as a decimal number [01,12]. + minute as a decimal number [00,59] + either AM or PM
    : d3.timeFormat('%H:%M'); // hour (24-hour clock) as a decimal number [00,23]. + minute as a decimal number [00,59]
};

export const getLuxonHourFormat = () => {
  const profileStore = useProfileStore();
  const { timeFormat } = profileStore.currentUser;
  return timeFormat === timeFormats['12H']
    ? 'hh:mm a'
    : 'HH:mm';
};

export function zonedMultiFormat(date, timezone) {
  const dt = DateTime.fromJSDate(date).setZone(timezone);
  if (dt.startOf('second') < dt) return dt.toFormat('.SSS');
  if (dt.startOf('minute') < dt) return dt.toFormat(':ss');
  if (dt.startOf('hour') < dt) return dt.toFormat(getLuxonHourFormat());
  if (dt.startOf('day') < dt) return dt.toFormat(getLuxonHourFormat());
  if (dt.startOf('month') < dt) {
    if (dt.startOf('week') < dt) return dt.toFormat('EEE dd');
    return dt.toFormat('dd MMM');
  }
  if (dt.startOf('year') < dt) return dt.toFormat('MMM');
  return dt.toFormat('yyyy');
}

export function regularMultiFormat(date) {
  let format = d3.timeFormat('%Y'); // year with century as a decimal number, such as 1999
  if (d3.timeSecond(date) < date) format = d3.timeFormat('.%L'); // milliseconds as a decimal number [000, 999].
  else if (d3.timeMinute(date) < date) format = d3.timeFormat(':%S'); // second as a decimal number [00,60].
  else if (d3.timeHour(date) < date) format = getHourFormat();
  else if (d3.timeDay(date) < date) format = getHourFormat();
  else if (d3.timeMonth(date) < date) {
    if (d3.timeWeek(date) < date) format = d3.timeFormat('%a %d'); // abbreviated weekday name + zero padded day of month
    else format = d3.timeFormat('%b %d'); // abbreviated month name + zero padded day of month
  } else if (d3.timeYear(date) < date) format = d3.timeFormat('%B'); // full month name
  return format(date);
}

export function utcMultiFormat(date) {
  let format = d3.timeFormat('%Y');
  if (d3.utcSecond(date) < date) format = d3.timeFormat('.%L');
  else if (d3.utcMinute(date) < date) format = d3.timeFormat(':%S');
  else if (d3.utcHour(date) < date) format = getHourFormat();
  else if (d3.utcDay(date) < date) format = getHourFormat();
  else if (d3.utcMonth(date) < date) {
    if (d3.utcWeek(date) < date) format = d3.timeFormat('%a %d');
    else format = d3.timeFormat('%b %d');
  } else if (d3.utcYear(date) < date) format = d3.timeFormat('%B');
  return format(date);
}
