const sortByEndAndLength = (data) => [...data].sort((a, b) => {
  if (a.end < b.end) {
    return 1;
  }
  if (a.end > b.end) {
    return -1;
  }
  if (a.len < b.len) {
    return 1;
  }
  if (a.len > b.len) {
    return -1;
  }
  return 0;
});

export default sortByEndAndLength;
