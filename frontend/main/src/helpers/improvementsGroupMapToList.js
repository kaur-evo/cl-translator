const groupMapToList = ({ map, groupName, itemsName }) => Object.entries(map)
  .map(([group, items]) => ({ [groupName]: group, [itemsName]: items }));
export default groupMapToList;
