import {
  convertToSet, mergeCustomizer, getGroupingVal, calcGroupPseudoKey, isLastOfTotals, isLastOfGroup,
} from './processDataGranularity';

describe('processDataGranularity', () => {
  describe('convertToSet function', () => {
    test('both source and destination are sets', () => {
      const destValue = new Set([1, 2, 3]);
      const srcValue = new Set([3, 4, 5]);
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    test('source is a set', () => {
      const destValue = [1, 2, 3];
      const srcValue = new Set([3, 4, 5]);
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([3, 4, 5]));
    });

    test('destination is a set and source is an array', () => {
      const destValue = new Set([1, 2, 3]);
      const srcValue = [3, 4, 5];
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    test('destination is a set', () => {
      const destValue = new Set([1, 2, 3]);
      const srcValue = 4;
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([1, 2, 3, 4]));
    });

    test('source is an array', () => {
      const destValue = 4;
      const srcValue = [1, 2, 3];
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([1, 2, 3]));
    });

    test('neither source nor destination are sets or arrays', () => {
      const destValue = 4;
      const srcValue = 5;
      const result = convertToSet(destValue, srcValue);
      expect(result).toEqual(new Set([5]));
    });
  });

  describe('mergeCustomizer function', () => {
    const ignoreKeys = new Set(['ignoreKey']);
    const primaryKeys = new Set(['primaryKey']);
    const convertToSetKeys = new Set(['convertToSetKey']);

    test('ignoreKeys case', () => {
      const destValue = 'destValue';
      const srcValue = 'srcValue';
      const mergeKey = 'ignoreKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toBe(srcValue);
    });

    test('primaryKeys case', () => {
      const destValue = 'destValue';
      const srcValue = 'srcValue';
      const mergeKey = 'primaryKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toBe(srcValue);
    });

    test('convertToSetKeys case with string value', () => {
      const destValue = new Set(['a', 'b']);
      const srcValue = 'c';
      const mergeKey = 'convertToSetKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(new Set(['a', 'b', 'c']));
    });

    test('convertToSetKeys case with array value with length 1', () => {
      const destValue = new Set(['a', 'b']);
      const srcValue = ['c'];
      const mergeKey = 'convertToSetKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(new Set(['a', 'b', 'c']));
    });

    test('convertToSetKeys case with array value with length 0', () => {
      const destValue = new Set(['a', 'b']);
      const srcValue = [];
      const mergeKey = 'convertToSetKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(new Set(['a', 'b']));
    });

    test('Number addition case with destination null', () => {
      const destValue = null;
      const srcValue = 10;
      const mergeKey = 'anyKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toBe(srcValue);
    });

    test('Number addition case with srcValue null', () => {
      const destValue = 5;
      const srcValue = null;
      const mergeKey = 'anyKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toBe(srcValue);
    });

    test('No merge keys matched case', () => {
      const destValue = 'destValue';
      const srcValue = 'srcValue';
      const mergeKey = 'someOtherKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toStrictEqual(new Set([srcValue]));
    });

    test('Set union case with destination null', () => {
      const destValue = null;
      const srcValue = new Set([1, 2, 3]);
      const mergeKey = 'anyKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(srcValue);
    });

    test('Array conversion case with destination null', () => {
      const destValue = null;
      const srcValue = [3, 4, 5];
      const mergeKey = 'anyKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(new Set([3, 4, 5]));
    });

    test('Set union case with empty destination set', () => {
      const destValue = new Set();
      const srcValue = new Set([1, 2, 3]);
      const mergeKey = 'anyKey';
      const result = mergeCustomizer(destValue, srcValue, mergeKey, { ignoreKeys, primaryKeys, convertToSetKeys });
      expect(result).toEqual(srcValue);
    });
  });
  describe('getGroupingVal function', () => {
    const TOTALS_GROUP_KEY = '%totals';

    test('Function key returns correct value', () => {
      const object = { key: 'value' };
      const keyFunction = (obj) => obj.key;
      const result = getGroupingVal(object, keyFunction);
      expect(result).toBe('value');
    });

    test('Non-function key returns correct value', () => {
      const object = { key: 'value' };
      const key = 'key';
      const result = getGroupingVal(object, key);
      expect(result).toBe('value');
    });

    test('Set with one element returns correct value', () => {
      const object = { key: new Set(['value']) };
      const key = 'key';
      const result = getGroupingVal(object, key);
      expect(result).toBe('value');
    });

    test('Set with multiple elements throws error', () => {
      const object = { key: new Set(['value1', 'value2']) };
      const key = 'key';
      expect(() => {
        getGroupingVal(object, key);
      }).toThrowError('Only one key is supported for grouping');
    });

    test('Array with one element returns correct value', () => {
      const object = { key: ['value'] };
      const key = 'key';
      const result = getGroupingVal(object, key);
      expect(result).toBe('value');
    });

    test('Array with multiple elements throws error', () => {
      const object = { key: ['value1', 'value2'] };
      const key = 'key';
      expect(() => {
        getGroupingVal(object, key);
      }).toThrowError('Only one key is supported for grouping');
    });

    test('TOTALS_GROUP_KEY returns itself', () => {
      const object = { key: 'value' };
      const key = TOTALS_GROUP_KEY;
      const result = getGroupingVal(object, key);
      expect(result).toBe(TOTALS_GROUP_KEY);
    });

    test('Empty object returns undefined', () => {
      const object = {};
      const key = 'key';
      const result = getGroupingVal(object, key);
      expect(result).toBe(undefined);
    });

    test('Empty key returns undefined', () => {
      const object = { key: 'value' };
      const key = '';
      const result = getGroupingVal(object, key);
      expect(result).toBe(undefined);
    });
  });

  describe('calcGroupPseudoKey function', () => {
    const keys = ['key1', 'key2', 'key3'];

    test('Calculate pseudo key at level 0', () => {
      const entry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const level = 0;
      const result = calcGroupPseudoKey(entry, level, keys);
      expect(result).toBe('value3-value2-value1');
    });

    test('Calculate pseudo key at level 1', () => {
      const entry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const level = 1;
      const result = calcGroupPseudoKey(entry, level, keys);
      expect(result).toBe('value3-value2');
    });

    test('Calculate pseudo key at level 2', () => {
      const entry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const level = 2;
      const result = calcGroupPseudoKey(entry, level, keys);
      expect(result).toBe('value3');
    });
  });

  describe('isLastOfTotals function', () => {
    const TOTALS_GROUP_KEY = '%totals';
    const sortedEntries = [0, 1, 2, 3, 4];

    test('Identify last entry as total', () => {
      const groupByKey = TOTALS_GROUP_KEY;
      const entryIndex = 4;

      const result = isLastOfTotals(groupByKey, entryIndex, sortedEntries);
      expect(result).toBe(true);
    });

    test('Identify non-last entry as total', () => {
      const groupByKey = TOTALS_GROUP_KEY;
      const entryIndex = 2;
      const result = isLastOfTotals(groupByKey, entryIndex, sortedEntries);
      expect(result).toBe(false);
    });

    test('Identify last entry of non-totals group', () => {
      const groupByKey = 'someOtherGroupKey';
      const entryIndex = 4;
      const result = isLastOfTotals(groupByKey, entryIndex, sortedEntries);
      expect(result).toBe(false);
    });
  });

  describe('isLastOfGroup function', () => {
    const groupByKeysReversed = ['key1', 'key2', 'key3'];

    test('Identify last entry of group', () => {
      const currentEntry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const nextEntry = undefined;
      const groupByKeyIndex = 2;
      const result = isLastOfGroup(currentEntry, nextEntry, groupByKeyIndex, groupByKeysReversed);
      expect(result).toBe(true);
    });

    test('Identify non-last entry of group', () => {
      const currentEntry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const nextEntry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const groupByKeyIndex = 2;
      const result = isLastOfGroup(currentEntry, nextEntry, groupByKeyIndex, groupByKeysReversed);
      expect(result).toBe(false);
    });

    test('Identify last entry of last group', () => {
      const currentEntry = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const nextEntry = undefined;
      const groupByKeyIndex = 0;
      const result = isLastOfGroup(currentEntry, nextEntry, groupByKeyIndex, groupByKeysReversed);
      expect(result).toBe(true);
    });
  });
});
