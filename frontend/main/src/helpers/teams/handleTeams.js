import sortByEndAndLength from './sortByEndAndLength';
import handleOverlaps from './handleOverlaps';

const handleTeams = (data) => {
  const sortedData = sortByEndAndLength(data);
  const result = sortedData.reduce((acc, cur) => { // starting from largest end value we'll start adding slices to new arr
    if (!acc.length) {
      acc.unshift(cur);
      return acc;
    }
    const overlaps = handleOverlaps(acc, cur);
    return overlaps;
  }, []);
  return result;
};

export default handleTeams;
