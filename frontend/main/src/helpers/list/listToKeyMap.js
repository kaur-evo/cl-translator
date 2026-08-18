export default (list, key, valueKey = null) => {
  if (!list || !list.length) return {};
  return list.reduce((map, obj) => {
    const value = valueKey ? obj[valueKey] : obj;
    if (typeof obj === 'number' || typeof obj === 'string') {
      return { ...map, [obj]: value };
    }
    return { ...map, [obj[key]]: value };
  }, {});
};
