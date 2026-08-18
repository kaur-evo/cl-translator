const getLastSliceQuantity = (timeline, slice) => {
  if (timeline.length === 0) return 0;
  const last5ProductSlices = {
    pcs: 0,
    quantity: 0,
    duration: 0,
  };
  let i = timeline.length - 1;
  do {
    if (timeline[i].type === 'PRODUCT' && !timeline[i].isFake) {
      last5ProductSlices.pcs += 1;
      last5ProductSlices.quantity += timeline[i].quantity;
      last5ProductSlices.duration += timeline[i].duration;
    }
    i -= 1;
  }
  while (last5ProductSlices.pcs < 5 && i >= 0 && !timeline[i].isProductChange);
  if (last5ProductSlices.pcs === 0) return 0;
  let quantity = last5ProductSlices.quantity / last5ProductSlices.pcs;
  const ctg = quantity * slice.cycleTimeGood;

  if (ctg > slice.duration) {
    const proportionalQty = (slice.duration / ctg) * quantity;
    quantity = proportionalQty;
  }
  return quantity;
};

export default getLastSliceQuantity;
