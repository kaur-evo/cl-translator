const MINUTES_IN_DAY = 1440;

export const convertMinutesToDays = (minutes) => {
  if (!minutes) return 0;
  return Math.round(minutes / MINUTES_IN_DAY);
};

export const convertDaysToMinutes = (days) => {
  if (!days) return 0;
  return days * MINUTES_IN_DAY;
};
