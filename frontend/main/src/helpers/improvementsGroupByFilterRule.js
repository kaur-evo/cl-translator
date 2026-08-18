const groupByFilterRule = ({ list, groupBy, filterRule }) => list.reduce((groupsMap, item) => {
  if (filterRule && !filterRule(item)) return groupsMap;
  const groupsMapCopy = { ...groupsMap };
  if ((item[groupBy] in groupsMap)) {
    groupsMapCopy[item[groupBy]].push(item);
  } else {
    groupsMapCopy[item[groupBy]] = [item];
  }
  return groupsMapCopy;
}, {});
export default groupByFilterRule;
