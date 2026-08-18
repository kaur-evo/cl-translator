import { formatNumber } from '../numbers/formatNumber';

const pad = (num) => num.toString().padStart(2, '0');

const formatSecondsShort = (timeInSecs, friendly = false, tooltipVal = false) => {
  let char = '';
  let value = timeInSecs;
  if (timeInSecs < 0) {
    char = '-';
    value = Math.abs(timeInSecs);
  }
  if (friendly) {
    if (tooltipVal) {
      const hourValue = formatNumber(Math.floor(value / 3600));
      return `${char}${hourValue}h ${Math.floor((value % 3600) / 60)}m ${value % 60}s`;
    }
    if (value < 3600) {
      return `${char}${Math.floor((value % 3600) / 60)}m ${value % 60}s`;
    }
    if (value >= 86400) {
      return `${char}${Math.floor(value / 86400)}d ${Math.floor((value % 86400) / 3600)}h`;
    }
    return `${char}${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`;
  }
  if (value < 3600) {
    return `${char}00:${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
  }
  return `${char}${pad(Math.floor(value / 3600))}:${pad(Math.floor((value % 3600) / 60))}:${pad(value % 60)}`;
};
export default formatSecondsShort;
