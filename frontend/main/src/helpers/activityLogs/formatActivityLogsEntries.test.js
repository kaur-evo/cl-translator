import formatActivityLogsEntries from './formatActivityLogsEntries';

describe('formatActivityLogsEntries', () => {
  it('returns two empty objects when both inputs are empty', () => {
    const map = {
      key1: { key: 'newKey1', value: (val) => val, persistent: true },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [];
    const newLogInput = [];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({ oldValues: [], newValues: [] });
  });

  it('returns formatted values for non-empty inputs', () => {
    const map = {
      key1: { key: 'newKey1', value: (val) => `formatted_${val}`, persistent: true },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [{ key1: 'oldValue1', key2: 'oldValue2' }];
    const newLogInput = [{ key1: 'newValue1', key2: 'newValue2' }];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[
        {
          key: 'newKey1', value: 'formatted_oldValue1', unchanged: false, isSubheader: false,
        },
        {
          key: 'newKey2', value: 'oldValue2', unchanged: false, isSubheader: false,
        },
      ]],
      newValues: [[
        {
          key: 'newKey1', value: 'formatted_newValue1', unchanged: false, isSubheader: false,
        },
        {
          key: 'newKey2', value: 'newValue2', unchanged: false, isSubheader: false,
        },
      ]],
    });
  });

  it('returns formatted values for multiple non-empty inputs', () => {
    const map = {
      key1: { key: 'newKey1', value: (val) => `formatted_${val}`, persistent: true },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [{ key1: 'oldValue1', key2: 'oldValue2' }];
    const newLogInput = [
      { key1: 'newValue1', key2: 'newValue2' },
      { key1: 'anotherNewValue1', key2: 'anotherNewValue2' },
    ];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[
        {
          key: 'newKey1', value: 'formatted_oldValue1', unchanged: false, isSubheader: false,
        },
        {
          key: 'newKey2', value: 'oldValue2', unchanged: false, isSubheader: false,
        },
      ]],
      newValues: [[
        {
          key: 'newKey1', value: 'formatted_newValue1', unchanged: false, isSubheader: false,
        },
        {
          key: 'newKey2', value: 'newValue2', unchanged: false, isSubheader: false,
        },
      ],
      [
        {
          key: 'newKey1', value: 'formatted_anotherNewValue1', unchanged: false, isSubheader: false,
        },
        {
          key: 'newKey2', value: 'anotherNewValue2', unchanged: false, isSubheader: false,
        },
      ]],
    });
  });

  it('handles empty values correctly', () => {
    const map = {
      key1: { key: 'newKey1', value: (val) => val, persistent: true },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [{ key1: '', key2: null }];
    const newLogInput = [{ key1: 'newValue1', key2: undefined }];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[{
        key: 'newKey1', value: '-', unchanged: false, isSubheader: false,
      }]],
      newValues: [[{
        key: 'newKey1', value: 'newValue1', unchanged: false, isSubheader: false,
      }]],
    });
  });

  it('handles ignored values correctly', () => {
    const map = {
      key1: {
        key: 'newKey1', value: (val) => val, persistent: true, ignore: (val) => val === 'ignore',
      },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [{ key1: 'ignore', key2: 'oldValue2' }];
    const newLogInput = [{ key1: 'newValue1', key2: 'newValue2' }];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[{
        key: 'newKey2', value: 'oldValue2', unchanged: false, isSubheader: false,
      }]],
      newValues: [[{
        key: 'newKey1', value: 'newValue1', unchanged: false, isSubheader: false,
      }, {
        key: 'newKey2', value: 'newValue2', unchanged: false, isSubheader: false,
      }]],
    });
  });

  it('handles persistent values correctly', () => {
    const map = {
      key1: { key: 'newKey1', value: (val) => val, persistent: true },
      key2: { key: 'newKey2', value: (val) => val, persistent: false },
    };
    const oldLogInput = [{ key1: 'sameValue', key2: 'sameValue2' }];
    const newLogInput = [{ key1: 'sameValue', key2: 'sameValue2' }];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[{
        key: 'newKey1', value: 'sameValue', unchanged: true, isSubheader: false,
      }]],
      newValues: [[{
        key: 'newKey1', value: 'sameValue', unchanged: true, isSubheader: false,
      }]],
    });
  });

  it('handles array values correctly', () => {
    const map = {
      key1: { key: 'formattedKey1', value: (val) => val },
      key2: { key: 'formattedKey2', value: (val) => val },
    };
    const oldLogInput = [{ key1: [{ key: 'nestedKey', value: 'oldValue' }, { key: 'nestedKey2', value: 'same' }], key2: 'oldValue2' }];
    const newLogInput = [{ key1: [{ key: 'nestedKey', value: 'newValue' }, { key: 'nestedKey2', value: 'same' }], key2: 'newValue2' }];

    const result = formatActivityLogsEntries(map, oldLogInput, newLogInput);

    expect(result).toEqual({
      oldValues: [[{
        key: 'formattedKey1',
        value: [{ key: 'nestedKey', value: 'oldValue' }],
        unchanged: false,
        isSubheader: false,
      },
      {
        key: 'formattedKey2',
        value: 'oldValue2',
        unchanged: false,
        isSubheader: false,
      }]],
      newValues: [[{
        key: 'formattedKey1',
        value: [{ key: 'nestedKey', value: 'newValue' }],
        unchanged: false,
        isSubheader: false,
      },
      {
        key: 'formattedKey2',
        value: 'newValue2',
        unchanged: false,
        isSubheader: false,
      }]],
    });
  });
});
