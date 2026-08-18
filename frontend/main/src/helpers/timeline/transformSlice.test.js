import transformSlice from './transformSlice';

describe('transformSlice', () => {
  test('that slow product is correct', () => {
    const slice = {
      type: 'PRODUCT',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:02:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:02:00.000Z',
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      qty: 1,
      scrapQty: 0,
    };
    const batch = {
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 0 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 120,
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 2,
      idealAltQty: 4,
      quantity: 1,
      quantityAlt: 2,
      scrapQty: 0,
      scrapAltQty: 0,
      yellowEnd: '2020-02-02T12:01:00.000Z',
    });
  });

  test('that SLOW product has yellowEnd set to second start', () => {
    const slice = {
      type: 'PRODUCT',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:02:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:02:00.000Z',
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      qty: 92,
      scrapQty: 0,
    };
    const batch = {
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 0 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 120,
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 600,
      idealAltQty: 1200,
      quantity: 92,
      quantityAlt: 184,
      scrapQty: 0,
      scrapAltQty: 0,
      yellowEnd: '2020-02-02T12:01:41.000Z',
    });
  });

  test('doesnt add yellowEnd to a slice that has less than 1s yellow', () => {
    const slice = {
      type: 'PRODUCT',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:00:19',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:00:19.000Z',
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      qty: 92,
      scrapQty: 0,
    };
    const batch = {
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 0 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 19,
      cycleTimeGood: 0.2,
      cycleTimeCritical: 190,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 95,
      idealAltQty: 190,
      quantity: 92,
      quantityAlt: 184,
      scrapQty: 0,
      scrapAltQty: 0,
    });
  });

  test('that green PRODUCT slice is correct', () => {
    const slice = {
      type: 'PRODUCT',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:01:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:01:00.000Z',
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      qty: 1,
      scrapQty: 1,
    };
    const batch = {
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 0 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 60,
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 1,
      idealAltQty: 2,
      quantity: 1,
      quantityAlt: 2,
      scrapQty: 1,
      scrapAltQty: 2,
    });
  });

  test('that green PRODUCT slice in timeMode after target is reached is correct', () => {
    const slice = {
      type: 'PRODUCT',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:01:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:01:00.000Z',
      cycleTimeGood: 0,
      cycleTimeCritical: 150,
      qty: 1,
      scrapQty: 1,
    };
    const batch = {
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 0 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 60,
      cycleTimeGood: 0,
      cycleTimeCritical: 150,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      yellowEnd: slice.endTimeLocalISO,
      idealQty: 1,
      idealAltQty: 2,
      quantity: 1,
      quantityAlt: 2,
      scrapQty: 1,
      scrapAltQty: 2,
    });
  });

  test('that STOPPAGE slice is correct', () => {
    const slice = {
      type: 'STOPPAGE',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:03:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:03:00.000Z',
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      commentId: 1,
    };
    const batch = {
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 240 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 180,
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      isProductChange: false,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 3,
      idealAltQty: 6,
      maxDuration: comment.maxDuration,
    });
  });

  test('that productChange slice is correct', () => {
    const slice = {
      type: 'STOPPAGE',
      startTimeLocal: '2020-02-02T12:00:00',
      endTimeLocal: '2020-02-02T12:03:00',
      startTimeLocalISO: '2020-02-02T12:00:00.000Z',
      endTimeLocalISO: '2020-02-02T12:03:00.000Z',
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      commentId: 1,
    };
    const batch = {
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      startTimeISO: '2020-02-02T12:01:00.000Z',
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 2,
    };
    const comment = { maxDuration: 240 };
    const result = transformSlice(slice, batch, comment, 'UTC');
    expect(result).toEqual({
      ...slice,
      sliceStartTmISO: slice.startTimeLocalISO,
      sliceEndTmISO: slice.endTimeLocalISO,
      duration: 180,
      cycleTimeGood: 60,
      cycleTimeCritical: 150,
      isProductChange: true,
      originalEndTimeString: slice.endTimeLocalISO,
      idealQty: 3,
      idealAltQty: 6,
      maxDuration: comment.maxDuration,
    });
  });
});
