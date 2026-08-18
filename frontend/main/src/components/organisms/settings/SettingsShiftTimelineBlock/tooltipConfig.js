import { mdiCircleMedium } from '@mdi/js';
import { DateTime } from 'luxon';

import i18n from '@/services/i18n';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { formatDateInZone } from '@/helpers/date/formatDate';

export function getTooltipDotRow(d) {
  const dotLabel = d.shiftName;

  if (dotLabel) {
    const dot = `<span class="d-flex ma-n2 pr-2">${vIconRawTemplate(mdiCircleMedium, 24, d.color, '')}</span>`;
    return `<div class="v-row align-center flex-nowrap">${dot}<span class="text-label-small">${dotLabel}</span></div>`;
  }
  return null;
}

export function getTooltipStartDateValue(d) {
  return formatDateInZone(d.startTimeISO, d.zoneId, 'long');
}

export function getTooltipDurationValue(d) {
  const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
  const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
  const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
  return humanizeDuration(duration, { largest: 'hour' });
}

export function getTooltipTimeRangeValue(d) {
  const startTime = formatTimeInZone(d.startTimeISO, d.zoneId);
  const endTime = formatTimeInZone(d.endTimeISO, d.zoneId);
  return `${startTime} - ${endTime} (${getTooltipDurationValue(d)})`;
}

export function getTooltipParamsRows(d) {
  const paramsRows = [{
    key: i18n.global.t('Start'),
    value: getTooltipStartDateValue(d),
  },
  {
    key: i18n.global.t('Time'),
    value: getTooltipTimeRangeValue(d),
  }];

  return paramsRows.map(({ key, value }) => `<div class="text-label-small font-weight-regular align-center d-flex">
              <span class="text-tertiary-dark font-weight-regular">${key}:&nbsp;</span>
              <span class="text-body-small font-weight-regular text-none">${value}</span>
              </div>`).join('');
}

export default async function getTooltipHTML(d) {
  const dotRow = getTooltipDotRow(d) || '';
  const params = getTooltipParamsRows(d);
  const extraInfoRow = d.disabled
    ? `<div class="align-center d-flex mt-1">
              <span class="font-weight-regular font-italic text-body-small text-none">${i18n.global.t('To edit this shift go to the Shift View')}</span>
              </div>`
    : '';
  const tooltipTemplate = `<div class="v-row align-center text-white"><v-col class="pb-2 pt-1">
        ${dotRow}
        ${params}
        ${extraInfoRow}
        </v-col></div>`;
  return tooltipTemplate;
}
