export function filterInvalidDateTimes(dateTimes) {
  return dateTimes.filter((dateTime) => dateTime?.isValid);
}
