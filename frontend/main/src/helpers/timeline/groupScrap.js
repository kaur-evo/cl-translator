const groupScrap = (timeline) => {
  const result = {};

  const addToResult = (elem) => {
    if (result[elem.batchId]) {
      result[elem.batchId].qty += elem.quantity;
      result[elem.batchId].scrapQty += elem.scrapQty || 0;
      result[elem.batchId].end = elem.sliceEndTmISO;
    } else {
      result[elem.batchId] = {
        start: elem.sliceStartTmISO,
        qty: elem.quantity,
        scrapQty: elem.scrapQty || 0,
        end: elem.sliceEndTmISO,
      };
    }
  };

  timeline.forEach((element) => {
    if (element.type === 'PRODUCT' && element.batchId !== -1) {
      addToResult(element);
    }
  });

  return result;
};

export default groupScrap;
