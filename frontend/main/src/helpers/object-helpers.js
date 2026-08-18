export function getPropertyList(map, keys, property) {
  if (!keys || !keys.length) return [];
  return keys.reduce((acc, id) => {
    if (map[id]) {
      acc.push(map[id][property]);
    }
    return acc;
  }, []);
}
