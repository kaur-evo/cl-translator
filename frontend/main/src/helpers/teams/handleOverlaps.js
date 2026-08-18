const handleOverlaps = (accumulator, current) => {
  const acc = [...accumulator];
  const cur = current;
  const prev = acc.shift();
  const leftOverlap = prev.overlapsLeft(cur);
  const noLeftOverlap = prev.noOverlapLeft(cur);
  const rightOverlap = prev.overlapsRight(cur);
  const noRightOverlap = prev.noOverlapRight(cur);
  const completeOverlap = prev.overlapsCompletely(cur);

  if (completeOverlap) {
    acc.unshift(...cur.cutCompleteOverlap(prev));
  } else if (leftOverlap) {
    acc.unshift(...cur.cutLeftOverlap(prev, true));
  } else if (rightOverlap) {
    acc.unshift(...cur.cutRightOverlap(prev, true));
  } else if (noLeftOverlap) {
    acc.unshift(...cur.cutLeftOverlap(prev));
  } else if (noRightOverlap) {
    acc.unshift(...cur.cutRightOverlap(prev));
  } else {
    throw new Error('Overlap error');
  }
  return acc;
};

export default handleOverlaps;
