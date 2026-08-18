import { DateTime } from 'luxon';

export function getTabNewIndicatorShownUntil(tab) {
  const now = DateTime.now().toUTC();
  const visibleDays = 30;
  if (!tab.sharedAtISO || now.diff(DateTime.fromISO(tab.sharedAtISO), 'days').days >= visibleDays) return null;
  return DateTime.fromISO(tab.sharedAtISO, { zone: 'UTC' }).plus({ days: visibleDays }).toISO();
}

export function getLatestNewIndicatorShownUntil(tabs) {
  let latestShownUntil = null;
  tabs.forEach((tab) => {
    const tabShownUntil = getTabNewIndicatorShownUntil(tab);
    if (tabShownUntil && (!latestShownUntil || tabShownUntil > latestShownUntil)) latestShownUntil = tabShownUntil;
  });
  return latestShownUntil;
}
