export function getNormalizedValue(value) {
  if (value === undefined || value === '' || value === 0) return null;
  return value;
}
