import { getDateLabelFormats } from './dashboardDateFormat';

describe('getDateLabelFormats', () => {
  const translations = { week: 'Week' };

  it('should return correct formats for day granularity', () => {
    const formats = getDateLabelFormats({ short: 'MM/dd/yyyy' }, 'day', translations);
    expect(formats).toEqual({ labelFormat: 'MM/dd/yyyy', shortFormat: 'dd' });
  });

  it('should return correct formats for month granularity', () => {
    const formats = getDateLabelFormats({ short: 'MM/yyyy' }, 'month', translations);
    expect(formats).toEqual({ labelFormat: 'MMMM', shortFormat: 'M' });
  });

  it('should return correct formats for weekofyear granularity', () => {
    const formats = getDateLabelFormats({ short: 'yyyy' }, 'weekofyear', translations);
    expect(formats).toEqual({ labelFormat: "'Week' w", shortFormat: 'w' });
  });

  it('should return correct formats for year granularity', () => {
    const formats = getDateLabelFormats({ short: 'yyyy' }, 'year', translations);
    expect(formats).toEqual({ labelFormat: 'yyyy', shortFormat: 'yyyy' });
  });
});
