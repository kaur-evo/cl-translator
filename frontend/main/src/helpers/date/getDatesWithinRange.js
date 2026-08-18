export function getDatesWithinRange(startRange, dateFormat) {
  const dates = [];
  const [start, end] = startRange;
  let currentDate = start.startOf('day');
  const endDate = end.startOf('day');

  while (currentDate <= endDate) {
    dates.push({
      name: currentDate.toFormat(dateFormat.short),
      date: currentDate.toFormat('yyyy-MM-dd'),
    });
    currentDate = currentDate.plus({ days: 1 });
  }

  return dates;
}
