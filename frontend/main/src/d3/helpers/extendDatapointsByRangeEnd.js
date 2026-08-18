export default (data, rangeStartKey, rangeEndKey) => {
  const dataClone = [...data];
  if (rangeEndKey) {
    // sometimes we need to create additional point for range object endings
    const rangeObjEndingHack = { ...data[data.length - 1] };
    rangeObjEndingHack[rangeStartKey] = rangeObjEndingHack[rangeEndKey];
    dataClone.push(rangeObjEndingHack);
  }
  return dataClone;
};
