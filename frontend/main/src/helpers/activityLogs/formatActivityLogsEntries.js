import { isEqual, isEmpty } from 'lodash';

export default function formatActivityLogsEntries(map, oldLogInput, newLogInput) {
  const process = (source, compare) => {
    if (isEmpty(source)) return [];

    // eslint-disable-next-line sonarjs/cognitive-complexity
    return Object.entries(map).reduce((acc, [key, { key: newKey, value, persistent, ignore, isSubheader = false }]) => {
      const sourceVal = source[key];
      const compareVal = compare?.[key];
      let formattedValue;
      let formattedCompareValue;

      const isValueMissing = (val) => val === null || val === undefined || (typeof val === 'string' && val.trim() === '');

      const hasSourceVal = !isValueMissing(sourceVal);
      const hasCompareVal = !isValueMissing(compareVal);

      if (!hasSourceVal && !hasCompareVal) {
        formattedValue = '-';
        formattedCompareValue = '-';
      } else if (!hasSourceVal && hasCompareVal) {
        formattedValue = '-';
        formattedCompareValue = value ? value(compareVal, compare, sourceVal) : compareVal;
      } else if (hasSourceVal && !hasCompareVal) {
        formattedValue = value ? value(sourceVal, source, compareVal) : sourceVal;
        formattedCompareValue = '-';
      } else {
        formattedValue = value ? value(sourceVal, source, compareVal) : sourceVal;
        formattedCompareValue = value && !isEmpty(compare) ? value(compareVal, compare, sourceVal) : compareVal;
      }

      if (formattedValue && Array.isArray(formattedValue)) {
        formattedValue = formattedValue.filter((item, i) => item.persistent || !isEqual(item.value, formattedCompareValue[i]?.value));
      }

      const isIgnored = typeof ignore === 'function' ? ignore(sourceVal, source, compare) : ignore;
      const hasChanged = !isEqual(formattedValue, formattedCompareValue);
      const isValueVisible = !isIgnored && (persistent || hasChanged);

      if (isValueVisible) {
        acc.push({
          key: newKey, value: formattedValue, unchanged: !hasChanged && !isSubheader, isSubheader,
        });
      }

      return acc;
    }, []);
  };

  const maxLength = Math.max(oldLogInput.length, newLogInput.length);

  const oldValues = [];
  const newValues = [];

  for (let i = 0; i < maxLength; i += 1) {
    const oldObj = oldLogInput?.[i] ?? {};
    const newObj = newLogInput?.[i] ?? {};
    const processedOldValues = process(oldObj, newObj);
    const processedNewValues = process(newObj, oldObj);
    if (processedOldValues.length > 0) oldValues.push(processedOldValues);
    if (processedNewValues.length > 0) newValues.push(processedNewValues);
  }

  return { oldValues, newValues };
}
