import {
  createSVTableHeadersConf, createSettingsLogsTableHeadersConf, formatUserActions, formatLogsToString, formatEntity,
} from './activityLogTableHeadersConf';

import i18n from '@/services/i18n';

describe('activityLogTableHeadersConf', () => {
  test('activityLogsTableHeadersConf for shift view', () => {
    expect(createSVTableHeadersConf()).toMatchSnapshot();
  });

  test('activityLogsTableHeadersConf for settings', () => {
    expect(createSettingsLogsTableHeadersConf()).toMatchSnapshot();
  });
});

describe('formatLogsToString', () => {
  it('returns - if the value is empty array', () => {
    const logs = [];
    expect(formatLogsToString(logs)).toBe('-');
  });

  it('returns formatted string', () => {
    const logs = [{ key: 'key1', value: 'value1' }, { key: 'key2', value: 'value2' }];
    expect(formatLogsToString(logs)).toBe('key1: value1, key2: value2');
  });

  it('returns formatted string when value is an array', () => {
    const logs = [{ key: 'key1', value: [{ key: 'subKey', value: 'subValue' }] }, { key: 'key2', value: 'value2' }];
    expect(formatLogsToString(logs)).toBe('key1: subKey: subValue, key2: value2');
  });

  it('returns correct string when key is empty', () => {
    const logs = [{ key: '', value: 'value1' }, { key: 'key2', value: 'value2' }];
    expect(formatLogsToString(logs)).toBe('value1, key2: value2');
  });

  it('returns formatted string from nested arrays', () => {
    const logs = [
      [{ key: 'key1', value: 'old_value1' }, { key: 'key2', value: [{ key: 'subKey', value: 'old_subValue' }] }],
      [{ key: 'key1', value: 'new_value1' }, { key: 'key2', value: [{ key: 'subKey', value: 'new_subValue' }] }],
    ];
    expect(formatLogsToString(logs)).toBe('key1: old_value1, key2: subKey: old_subValue, key1: new_value1, key2: subKey: new_subValue');
  });

  it('returns subHeader correctly formatted', () => {
    const logs = [{ key: 'key1', value: '', isSubheader: true }];
    expect(formatLogsToString(logs)).toBe('key1');
  });
});

describe('formatUserActions', () => {
  beforeAll(() => {
    i18n.global.t = vi.fn((key) => key);
  });

  it('should return "Added" if oldValues is empty and newValues is not empty', () => {
    const entry = { oldValues: [], newValues: [{ key: 'value' }] };
    expect(formatUserActions('Saved', entry)).toBe('Added');
  });

  it('should return "Saved" if both oldValues and newValues are not empty', () => {
    const entry = { oldValues: [{ key: 'oldValue' }], newValues: [{ key: 'newValue' }] };
    expect(formatUserActions('Saved', entry)).toBe('Saved');
  });

  it('should return the action itself if it is not "Saved"', () => {
    expect(formatUserActions('Deleted', {})).toBe('Deleted');
  });

  it('should return the action itself if oldValues and newValues are both empty', () => {
    const entry = { oldValues: [], newValues: [] };
    expect(formatUserActions('Saved', entry)).toBe('Saved');
  });
});

describe('formatEntity', () => {
  it('returns correct entity string for PRODUCT with connected station in new values', () => {
    const entity = { entityType: 'PRODUCT' };
    const item = { newValues: [[{ key: 'Station', value: 'Station 1' }], [{ key: 'Key1', value: 'Value 1' }]], oldValues: [] };
    expect(formatEntity(entity, item)).toBe('products (connected station)');
  });

  it('returns correct entity string for PRODUCT with connected station in old values', () => {
    const entity = { entityType: 'PRODUCT' };
    const item = { newValues: [], oldValues: [[{ key: 'Station', value: 'Station 1' }], [{ key: 'Key1', value: 'Value 1' }]] };
    expect(formatEntity(entity, item)).toBe('products (connected station)');
  });

  it('returns correct entity string for PRODUCT without connected station', () => {
    const entity = { entityType: 'PRODUCT' };
    const item = { newValues: [[{ key: 'Name', value: 'Product name change' }]], oldValues: [[{ key: 'Name', value: 'Product name change old' }]] };
    expect(formatEntity(entity, item)).toBe('products');
  });

  it('returns correct entity string for SHIFT with stop reason in new values', () => {
    const entity = { entityType: 'SHIFT' };
    const item = { newValues: [[{ key: 'Stop reason', value: 'Comment 1' }]], oldValues: [] };
    expect(formatEntity(entity, item)).toBe('Shifts (downtime auto-commenting)');
  });

  it('returns correct entity string for SHIFT with stop reason in old values', () => {
    const entity = { entityType: 'SHIFT' };
    const item = { newValues: [], oldValues: [[{ key: 'Stop reason', value: 'Comment 1' }]] };
    expect(formatEntity(entity, item)).toBe('Shifts (downtime auto-commenting)');
  });

  it('returns correct entity string for SHIFT without stop reason', () => {
    const entity = { entityType: 'SHIFT' };
    const item = { newValues: [[{ key: 'Name', value: 'Shift' }]], oldValues: [[{ key: 'Name', value: 'Shift old' }]] };
    expect(formatEntity(entity, item)).toBe('Shifts');
  });

  it('returns correct entity string for SECURITY item', () => {
    const entity = { entityType: 'SECURITY', reference: 'Security Reference' };
    expect(formatEntity(entity)).toBe('Security (Security Reference)');
  });

  it('returns correct entity string for other entities', () => {
    const entity = { entityType: 'STOP_REASON' };
    const item = { newValues: [[{ key: 'Name', value: 'Stop reason change' }]], oldValues: [[{ key: 'Name', value: 'Stop reason change old' }]] };
    expect(formatEntity(entity, item)).toBe('Stop reasons');
  });
});
