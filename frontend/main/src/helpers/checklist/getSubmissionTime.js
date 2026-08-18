import { DateTime } from 'luxon';

import { formatDate } from '@/helpers/date/formatDate';
import { formatTimeInZone } from '@/helpers/time/formatTime';

export const getSubmissionTime = (check, zone) => {
  if (!check.submissionTimeISO) return null;
  const time = formatTimeInZone(check.submissionTimeISO, zone);
  const checkTime = DateTime.fromISO(check.dateTimeISO, { zone });
  const submissionTime = DateTime.fromISO(check.submissionTimeISO, { zone });
  if (submissionTime.startOf('day').toISO() !== checkTime.startOf('day').toISO()) {
    return `${time} - ${formatDate(check.submissionTimeISO, 'long')}`;
  }
  return time;
};
