const timeFormats = {
  '12H': 12,
  '24H': 24,
};

const timeFormatMap = {
  [timeFormats['24H']]: {
    short: 'HH:mm', long: 'HH:mm:ss', hour: 'HH', luxonHour: 'HH', luxonShort: 'HH:mm', luxonLong: 'HH:mm:ss',
  },
  [timeFormats['12H']]: {
    short: 'h:mma', long: 'h:mm:ssa', hour: 'ha', luxonHour: 'ha', luxonShort: 'h:mma', luxonLong: 'h:mm:ssa',
  },
};

const dateFormatsMap = {
  'MM/DD/YYYY': { long: 'MM/dd/yyyy', short: 'MM/dd' },
  'MM-DD-YYYY': { long: 'MM-dd-yyyy', short: 'MM-dd' },
  'MM.DD.YYYY': { long: 'MM.dd.yyyy', short: 'MM.dd' },
  'DD/MM/YYYY': { long: 'dd/MM/yyyy', short: 'dd/MM' },
  'DD-MM-YYYY': { long: 'dd-MM-yyyy', short: 'dd-MM' },
  'DD.MM.YYYY': { long: 'dd.MM.yyyy', short: 'dd.MM' },
  'YYYY/MM/DD': { long: 'yyyy/MM/dd', short: 'MM/dd' },
  'YYYY-MM-DD': { long: 'yyyy-MM-dd', short: 'MM-dd' },
  'YYYY.MM.DD': { long: 'yyyy.MM.dd', short: 'MM.dd' },
};

const defaultNumberFormattingOptions = {
  decimalSeparator: ',',
  groupSeparator: ' ',
  decimalPlaces: 2,
  pctDecimalPlaces: 2,
};

const defaultLocalizationOptions = {
  ...defaultNumberFormattingOptions,
  dateFormat: 'DD.MM.YYYY',
  firstDayOfWeek: '1',
  timeFormat: timeFormats['24H'],
};

export {
  timeFormats, timeFormatMap, dateFormatsMap, defaultNumberFormattingOptions, defaultLocalizationOptions,
};
