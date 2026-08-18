export function formatTimeRange(timeRange, dateFormat, timeFormat) {
  if (!timeRange[0].toISO() || !timeRange[1].toISO()) return '';
  const timeWithoutDateFormat = `${timeFormat.luxonShort}`;
  const timeWithDateFormat = `${timeFormat.luxonShort} (${dateFormat.short})`;
  const isDateRangeOnSameDay = timeRange[0].hasSame(timeRange[1], 'day');
  const formattedStart = timeRange[0].toFormat(isDateRangeOnSameDay ? timeWithoutDateFormat : timeWithDateFormat);
  const formattedEnd = timeRange[1].toFormat(timeWithDateFormat);
  return `${formattedStart} - ${formattedEnd}`;
}
