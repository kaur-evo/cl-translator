export function isTimeBetweenRange(start, end, comparison) {
  if (end <= start) {
    return (comparison >= start && comparison <= '23:59') || (comparison >= '00:00' && comparison <= end);
  }
  return comparison >= start && comparison <= end;
}

export function isTimeOverlapping(startTime1, endTime1, startTime2, endTime2) {
  const dateOfStartTime1 = new Date(`2020-01-01T${startTime1}:00`);
  const dateOfEndTime1 = new Date(`2020-01-01T${endTime1}:00`);
  const dateOfStartTime2 = new Date(`2020-01-01T${startTime2}:00`);
  const dateOfEndTime2 = new Date(`2020-01-01T${endTime2}:00`);

  if (dateOfStartTime1.getTime() < dateOfEndTime1.getTime()) {
    if (dateOfStartTime2.getTime() < dateOfEndTime2.getTime()) {
      return (dateOfStartTime1.getTime() < dateOfEndTime2.getTime() && dateOfStartTime2.getTime() < dateOfEndTime1.getTime());
    }
    return dateOfStartTime1.getTime() < dateOfEndTime2.getTime() || dateOfStartTime2.getTime() < dateOfEndTime1.getTime();
  }
  if (dateOfStartTime2.getTime() < dateOfEndTime2.getTime()) {
    return dateOfStartTime1.getTime() < dateOfEndTime2.getTime() || dateOfStartTime2.getTime() < dateOfEndTime1.getTime();
  }
  return true;
}
