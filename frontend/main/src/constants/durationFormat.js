import i18n from '@/services/i18n';

export const durationFormats = {
  READABLE: 'READABLE',
  SECONDS: 'SECONDS',
  MINUTES: 'MINUTES',
  HOURS: 'HOURS',
};

export const getDurationFormatsArray = () => [
  { text: i18n.global.t('Readable'), id: durationFormats.READABLE },
  { text: i18n.global.t('Seconds'), id: durationFormats.SECONDS },
  { text: i18n.global.t('Minutes'), id: durationFormats.MINUTES },
  { text: i18n.global.t('Hours'), id: durationFormats.HOURS },
];
