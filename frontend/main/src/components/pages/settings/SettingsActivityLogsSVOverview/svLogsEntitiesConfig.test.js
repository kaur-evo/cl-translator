import getSVLogsEntityConfig, {
  getReasonTranslation, isNotApplicable, getChecklistItemValue, getChecklistTaskResults, formatWithUnit, getFormattedTimeValue,
} from './svLogsEntitiesConfig';

import i18n from '@/services/i18n';

describe('getReasonTranslation', () => {
  it('should return translated reason for "Uncommented"', () => {
    const result = getReasonTranslation('Uncommented');
    expect(result).toBe(i18n.global.t('Uncommented'));
  });

  it('should return the same reason if not "Uncommented"', () => {
    const result = getReasonTranslation('OtherReason');
    expect(result).toBe('OtherReason');
  });
});

describe('isNotApplicable', () => {
  it('should return true if item is not applicable', () => {
    const result = isNotApplicable({ notApplicableEnabled: true, valueNotApplicable: true });
    expect(result).toBe(true);
  });

  it('should return false if item is applicable', () => {
    const result = isNotApplicable({ notApplicableEnabled: false, valueNotApplicable: false });
    expect(result).toBe(false);
  });
});

describe('getChecklistItemValue', () => {
  it('should return "N/A" if item is not applicable', () => {
    const result = getChecklistItemValue({ notApplicableEnabled: true, valueNotApplicable: true });
    expect(result).toBe('N/A');
  });

  it('should return "Yes" if type is YES_NO and value true', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false, valueNotApplicable: false, type: 'YES_NO', value: 'true',
    });
    expect(result).toBe('Yes');
  });

  it('should return "No" if type is YES_NO and value false', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false, valueNotApplicable: false, type: 'YES_NO', value: 'false',
    });
    expect(result).toBe('No');
  });

  it('should return "-" if type is YES_NO and value is null', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false, valueNotApplicable: false, type: 'YES_NO', value: null,
    });
    expect(result).toBe('-');
  });

  it('should return "-" if type is MEASUREMENT and value is null', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'MEASUREMENT',
      value: null,
      unit: 'cm',
      minVal: 5,
      maxVal: 15,
    });
    expect(result).toBe('-');
  });

  it('should return "-" if type is MEASUREMENT and value empty array as a string', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'MEASUREMENT',
      value: '[]',
      unit: 'cm',
      minVal: 5,
      maxVal: 15,
    });
    expect(result).toBe('-');
  });

  it('should return single value if type is MEASUREMENT and value is a single number as a string', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'MEASUREMENT',
      value: '10',
      unit: 'cm',
      minVal: 5,
      maxVal: 15,
    });
    expect(result).toBe('10 cm (5 - 15 cm)');
  });

  it('should return comma separated values if type is MEASUREMENT and value is an array of numbers as a string', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'MEASUREMENT',
      value: '[10, 12]',
      unit: 'cm',
      minVal: 5,
      maxVal: 15,
    });
    expect(result).toBe('10; 12 cm (5 - 15 cm)');
  });

  it('should return formatted text value if type is TEXT', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'TEXT',
      value: 'Sample text',
    });
    expect(result).toBe('Sample text');
  });

  it('should return "-" if type is TEXT and value is null', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'TEXT',
      value: null,
    });
    expect(result).toBe('-');
  });

  it('should return "Done" if type is CHECK and value is true', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'CHECK',
      value: true,
    });
    expect(result).toBe('Done');
  });

  it('should return "-" if type is CHECK and value is null', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'CHECK',
      value: null,
    });
    expect(result).toBe('-');
  });

  it('should return formatted selection value if type is SELECTION', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'SELECTION',
      value: JSON.stringify(['Option1', 'Option2']),
    });
    expect(result).toBe('Option1, Option2');
  });

  it('should return "-" if type is SELECTION and value is null', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'SELECTION',
      value: null,
    });
    expect(result).toBe('-');
  });

  it('should return empty string for unknown type', () => {
    const result = getChecklistItemValue({
      notApplicableEnabled: false,
      valueNotApplicable: false,
      type: 'UNKNOWN',
      value: 'Some value',
    });
    expect(result).toBe('');
  });
});

describe('getChecklistTaskResults', () => {
  it('returns correct result for checklist items', () => {
    const elements = [
      {
        id: 1, name: 'Task 1', comment: 'Comment 1', value: 'true', type: 'CHECK',
      },
      {
        id: 2, name: 'Task 2', comment: '', value: 'false', type: 'CHECK',
      },
      {
        id: 3, name: 'Task 3', comment: '', value: 'true', type: 'CHECK',
      },
    ];
    const compareElements = [
      {
        id: 1, name: 'Task 1', comment: '', value: '', type: 'CHECK',
      },
      {
        id: 2, name: 'Task 2', comment: '', value: '', type: 'CHECK',
      },
      {
        id: 3, name: 'Task 3', comment: 'comment here', value: 'true', type: 'CHECK',
      },
    ];
    const result = getChecklistTaskResults(elements, compareElements);
    expect(result).toEqual([
      {
        keyPrefix: '1)', prefixClass: 'font-weight-medium mr-1', key: 'Task 1', value: 'Done\nExtra note: Comment 1',
      },
      {
        keyPrefix: '2)', prefixClass: 'font-weight-medium mr-1', key: 'Task 2', value: 'Done',
      },
      {
        keyPrefix: '3)', prefixClass: 'font-weight-medium mr-1', key: 'Task 3', value: 'Done\nExtra note: -',
      },
    ]);
  });

  it('includes "Images:" line with comma-separated filenames when attachmentsEnabled is true', () => {
    const elements = [
      {
        id: 1,
        name: 'Check paint',
        comment: '',
        value: 'true',
        type: 'CHECK',
        attachmentsEnabled: true,
        images: 'paint_check.jpg, paint_check2.jpg',
      },
    ];
    const result = getChecklistTaskResults(elements, []);
    expect(result[0].value).toContain('Images: paint_check.jpg, paint_check2.jpg');
  });

  it('does not include "Images:" line when attachmentsEnabled is false or undefined (backward compatibility)', () => {
    const elementsUndefined = [
      {
        id: 1,
        name: 'Check paint',
        comment: '',
        value: 'true',
        type: 'CHECK',
        images: 'paint_check.jpg',
      },
    ];
    const elementsFalse = [
      {
        id: 1,
        name: 'Check paint',
        comment: '',
        value: 'true',
        type: 'CHECK',
        attachmentsEnabled: false,
        images: 'paint_check.jpg',
      },
    ];
    const resultUndefined = getChecklistTaskResults(elementsUndefined, []);
    const resultFalse = getChecklistTaskResults(elementsFalse, []);
    expect(resultUndefined[0].value).not.toContain('Images');
    expect(resultFalse[0].value).not.toContain('Images');
  });

  it('includes "Images: -" when attachmentsEnabled is true but no images uploaded', () => {
    const elements = [
      {
        id: 1,
        name: 'Check paint',
        comment: '',
        value: 'true',
        type: 'CHECK',
        attachmentsEnabled: true,
        images: '-',
      },
    ];
    const result = getChecklistTaskResults(elements, []);
    expect(result[0].value).toContain('Images: -');
  });

  it('includes both "Extra note:" and "Images:" lines in correct order when both exist', () => {
    const elements = [
      {
        id: 1,
        name: 'Check paint',
        comment: 'Paint looks good',
        value: 'true',
        type: 'CHECK',
        attachmentsEnabled: true,
        images: 'evidence.jpg',
      },
    ];
    const result = getChecklistTaskResults(elements, []);
    expect(result[0].value).toContain('Extra note: Paint looks good');
    expect(result[0].value).toContain('Images: evidence.jpg');
    const noteIndex = result[0].value.indexOf('Extra note');
    const imagesIndex = result[0].value.indexOf('Images:');
    expect(noteIndex).toBeLessThan(imagesIndex);
  });
});

test('that formatWithUnit formats values correctly', () => {
  expect(formatWithUnit(10, 'kg')).toBe('10 kg');
  expect(formatWithUnit(5, 'm')).toBe('5 m');
  expect(formatWithUnit(0, 's')).toBe('0 s');
});

test('that getFormattedTimeValue returns formatted time value', () => {
  const result = getFormattedTimeValue('2023-03-15T12:00:00Z', 'UTC');
  expect(result).toBe('15.03.2023 12:00');
});

describe('getSVLogsEntityConfig', () => {
  it('returns correct config for DOWNTIME eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'DOWNTIME', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for CHECKLIST eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'CHECKLIST', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SIGNAL eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'SIGNAL', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for BATCH eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'BATCH', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SCRAP eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'SCRAP', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SHIFT eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'SHIFT', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for SPEED_LOSS eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'SPEED_LOSS', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  it('returns correct config for OPERATOR eventType', () => {
    const config = getSVLogsEntityConfig({ eventType: 'OPERATOR', zoneId: 'UTC' });
    expect(config).toMatchSnapshot();
  });

  describe('BATCH productSku ignore function', () => {
    it('should ignore productSku when it equals productName', () => {
      const config = getSVLogsEntityConfig({ eventType: 'BATCH', zoneId: 'UTC' });
      const item = { productName: 'TestProduct', productSku: 'TestProduct' };
      expect(config.productSku.ignore(item.productSku, item)).toBe(true);
    });

    it('should not ignore productSku when it differs from productName', () => {
      const config = getSVLogsEntityConfig({ eventType: 'BATCH', zoneId: 'UTC' });
      const item = { productName: 'TestProduct', productSku: 'SKU-123' };
      expect(config.productSku.ignore(item.productSku, item)).toBe(false);
    });
  });
});
