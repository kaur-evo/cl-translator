const groupScrapArray = (scrapArray) => {
  const result = {};
  scrapArray.forEach((slice) => {
    const scrapRange = { startTimeISO: slice.sliceStartTmISO, endTimeISO: slice.sliceEndTmISO };
    if (!result[slice.batchId]) {
      result[slice.batchId] = {
        [[slice.scrapReasonId, slice.scrapNotes]]: {
          scrapQty: slice.scrapQty,
          scrapNotes: slice.scrapNotes,
          scrapReasonId: slice.scrapReasonId,
          scrapRanges: [scrapRange],
        },
      };
    } else if (result[slice.batchId][[slice.scrapReasonId, slice.scrapNotes]]) {
      result[slice.batchId][[slice.scrapReasonId, slice.scrapNotes]].scrapQty += slice.scrapQty;
      result[slice.batchId][[slice.scrapReasonId, slice.scrapNotes]].scrapRanges.push(scrapRange);
    } else {
      result[slice.batchId][[slice.scrapReasonId, slice.scrapNotes]] = {
        scrapQty: slice.scrapQty,
        scrapNotes: slice.scrapNotes,
        scrapReasonId: slice.scrapReasonId,
        scrapRanges: [scrapRange],
      };
    }
  });
  return result;
};

export default groupScrapArray;
