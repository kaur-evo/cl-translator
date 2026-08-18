import { differenceInMinutes } from 'date-fns';

const MINUTES_IN_YEAR = 525600;
const MINUTES_IN_DAY = 1440;

export const calculateTimePassed = (date, hideMoreThanYearAgo) => {
  let timePassedText;
  const timePassed = differenceInMinutes(new Date(), new Date(date));
  if (Number.isNaN(timePassed) || (timePassed > MINUTES_IN_YEAR && hideMoreThanYearAgo)) return '';
  if (timePassed > MINUTES_IN_YEAR) timePassedText = `${Math.floor(timePassed / MINUTES_IN_YEAR)}y ${Math.floor((timePassed % MINUTES_IN_YEAR) / MINUTES_IN_DAY)}d`; // More than a year ago
  else if (timePassed > MINUTES_IN_DAY) timePassedText = `${Math.floor(timePassed / MINUTES_IN_DAY)}d ${Math.floor((timePassed % MINUTES_IN_DAY) / 60)}h`; // More than a day ago
  else if (timePassed > 60) timePassedText = `${Math.floor(timePassed / 60)}h ${Math.floor(timePassed % 60)}m`; // More than an hour ago
  else timePassedText = `${timePassed}m`;
  return timePassedText;
};
