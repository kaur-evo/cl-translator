export const joinShiftOverlapMessage = (stations, overlaps) => {
  const result = overlaps.map(({ stationId, shiftName }) => {
    const stationName = stations[stationId]?.name;
    return `${shiftName} (${stationName})`;
  });
  return result.join(', ');
};
