const getLeftLimitRange = (currentRange, lastOfLevelMap) => {
  let leftLimitRange = lastOfLevelMap[currentRange.level]; // preceeding range of same level
  if (!leftLimitRange) {
    leftLimitRange = { rangeEnd: 0, rangeStart: 0, level: currentRange.level };
  }
  return leftLimitRange;
};


const applyRepositioning = (range, isOverlappingLeft, isOverlappingRight, getRangeWidth, marginX) => {
  if (isOverlappingLeft) {
    const relX = getRangeWidth() / 2;
    range.rangeStart += relX - marginX; // eslint-disable-line no-param-reassign
    range.rangeEnd += relX + marginX; // eslint-disable-line no-param-reassign
    return relX - marginX;
  }
  if (isOverlappingRight) {
    const relX = -getRangeWidth() / 2;
    range.rangeStart += relX - marginX; // eslint-disable-line no-param-reassign
    range.rangeEnd += relX + marginX; // eslint-disable-line no-param-reassign
    return relX + marginX;
  }
  return 0;
};

// Safety limit to prevent infinite loops when layout is impossible
const MAX_LEVEL = 100;

// Description: This function takes an array of ranges and repositions them to avoid overlapping while bounding them to not move more than 50% of their width to the left or right.
// if the range fit is impossible it will move the range to another level. (level indicates next row on y axis)
export default function getAnchoredOverlappingRangesRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing }) {
  // Guard against invalid inputs that could cause infinite loops
  if (!rightMaxLimit || rightMaxLimit <= 0 || !Number.isFinite(rightMaxLimit)) {
    return inputRanges.map((range) => ({
      ...range,
      level: range.level ?? 0,
      transform: 'translate(0, 0)',
      relativeX: 0,
      relativeY: 0,
    }));
  }

  const ranges = [...inputRanges];
  const rowHeight = 25;
  const lastOfLevelMap = {};
  for (let i = 0; i < ranges.length; i += 1) {
    ranges[i].level = ranges[i].level === undefined ? 0 : ranges[i].level;
    const marginX = horizontalSpacing || 0;
    const getRangeStart = () => ranges[i].rangeStart - marginX;
    const getRangeEnd = () => ranges[i].rangeEnd + marginX;

    const getRangeWidth = () => getRangeEnd() - getRangeStart();
    const getRangeMidPoint = () => (getRangeStart() + getRangeEnd()) / 2;

    const isRangeOverlappingLeftLimit = () => getRangeStart() < getLeftLimitRange(ranges[i], lastOfLevelMap).rangeEnd;
    const getRightLimitRange = () => {
      const nextRange = ranges[i + 1];
      if (!nextRange) {
        return { rangeEnd: rightMaxLimit, rangeStart: rightMaxLimit, level: 0 };
      }
      if (nextRange.level === undefined) {
        nextRange.level = 0;
      }
      return nextRange;
    };
    const isRangeOverlappingRightLimit = () => getRangeEnd() > getRightLimitRange().rangeStart && ranges[i].level === getRightLimitRange().level;

    const isImpossibleLeftFit = () => {
      const midPointOverlapsWithPrevious = getRangeMidPoint() < getLeftLimitRange(ranges[i], lastOfLevelMap).rangeEnd;
      const wouldOverlapLeftEdgeAfterReposition = !isRangeOverlappingLeftLimit() && isRangeOverlappingRightLimit()
        && getRangeStart() - (getRangeWidth() / 2) < 0;
      return midPointOverlapsWithPrevious || wouldOverlapLeftEdgeAfterReposition;
    };
    const isImpossibleRightFit = () => {
      const ret = getRangeStart() - (getRangeWidth() / 2) < getLeftLimitRange(ranges[i], lastOfLevelMap).rangeEnd;
      const regularOverlapWithRightEdge = getRangeEnd() > rightMaxLimit;
      const wouldOverlapRightEdgeAfterReposition = isRangeOverlappingLeftLimit() && getRangeEnd() + (getRangeWidth() / 2) > rightMaxLimit;
      return ret && (regularOverlapWithRightEdge || wouldOverlapRightEdgeAfterReposition);
    };
    let relativeY = 0;
    let relativeX = 0;
    while (isImpossibleLeftFit() && ranges[i].level < MAX_LEVEL) {
      ranges[i].level += 1;
      relativeY = ranges[i].level * rowHeight;
    }

    while (isImpossibleRightFit() && ranges[i].level < MAX_LEVEL) {
      ranges[i].level += 1;
      relativeY = ranges[i].level * rowHeight;
    }

    // Reposition range if it's on the same level as the previous range
    if (ranges[i].level === getLeftLimitRange(ranges[i], lastOfLevelMap).level) {
      relativeX = applyRepositioning(
        ranges[i],
        isRangeOverlappingLeftLimit(),
        isRangeOverlappingRightLimit(),
        getRangeWidth,
        marginX,
      );
    }

    lastOfLevelMap[ranges[i].level] = ranges[i];
    ranges[i].transform = `translate(${relativeX}, ${relativeY})`;
    ranges[i].relativeX = relativeX;
    ranges[i].relativeY = relativeY;
  }
  return ranges;
}
