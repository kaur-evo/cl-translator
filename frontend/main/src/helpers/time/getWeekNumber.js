export default function getWeekNumber(_d, firstDayOfWeek = 1) {
  // Copy date so don't modify original
  const d = new Date(Date.UTC(_d.getFullYear(), _d.getMonth(), _d.getDate()));
  let day = d.getUTCDay();
  // Make Sunday's day number 7
  if (firstDayOfWeek === 1 && day === 0) day = 7;
  // Set to nearest Thursday: current date + 4 - current day number
  d.setUTCDate(d.getUTCDate() + 4 - day);
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / (86400 * 1000)) + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}
