import processTimeline, { processSlice, addSlice } from './processFactoryViewTimeline';

import colorConstants from '@/constants/colorConstants';

describe('processFactoryViewTimeline', () => {
  describe('processSlice', () => {
    it('processes correctly slow product slice without comment', () => {
      const slice = {
        typ: 'PRODUCT',
        stTmISO: '2025-01-24T12:47:43.000+02:00',
        enTmISO: '2025-01-24T12:49:25.000+02:00',
        gDur: 60,
        plc: 0, // = performance loss comment
      };
      const result = processSlice({ slice, commentsMap: {}, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'PRODUCT_SLOW_UNCOMMENTED',
        sliceColor: colorConstants.dark['lw-yellow'],
      });
    });

    it('processes correctly slow product slice with comment', () => {
      const slice = {
        typ: 'PRODUCT',
        stTmISO: '2025-01-24T12:47:43.000+02:00',
        enTmISO: '2025-01-24T12:49:25.000+02:00',
        gDur: 60,
        plc: 7, // = performance loss comment
      };
      const result = processSlice({ slice, commentsMap: {}, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'PRODUCT_SLOW_COMMENTED',
        sliceColor: colorConstants.dark['lw-orange'],
      });
    });

    it('processes correctly slow product slice that is less than yellowThreshold over good duration', () => {
      const slice = {
        typ: 'PRODUCT',
        stTmISO: '2025-01-24T12:47:43.000+02:00',
        enTmISO: '2025-01-24T12:48:50.000+02:00', // 67s
        gDur: 60,
        plc: 7,
      };
      const result = processSlice({
        slice, commentsMap: {}, timezone: 'Europe/Tallinn', yellowThreshold: 30,
      });

      expect(result).toEqual({
        ...slice,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
    });

    it('processes correctly good product slice', () => {
      const slice = {
        typ: 'PRODUCT',
        stTmISO: '2025-01-24T12:47:45.000+02:00',
        enTmISO: '2025-01-24T12:48:15.000+02:00', // 30s
        gDur: 60,
        plc: 0,
      };
      const result = processSlice({ slice, commentsMap: {}, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
    });

    it('processes correctly stoppage slice without comment', () => {
      const slice = {
        typ: 'STOPPAGE',
        cId: 0,
      };
      const result = processSlice({ slice, commentsMap: {}, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'STOPPAGE_UNCOMMENTED',
        sliceColor: colorConstants.dark['lw-red'],
      });
    });

    it('processes correctly stoppage slice with comment', () => {
      const slice = {
        typ: 'STOPPAGE',
        cId: 7,
      };
      const result = processSlice({ slice, commentsMap: { 7: { name: 'test comment' } }, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'STOPPAGE_COMMENTED',
        sliceColor: colorConstants.dark['lw-dark-red'],
        sliceLabel: 'test comment',
      });
    });

    it('processes correctly stoppage slice with comment if comment is missing from commentsmap', () => {
      const slice = {
        typ: 'STOPPAGE',
        cId: 8,
      };
      const result = processSlice({ slice, commentsMap: { 7: { name: 'test comment' } }, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'STOPPAGE_COMMENTED',
        sliceColor: colorConstants.dark['lw-dark-red'],
        sliceLabel: undefined,
      });
    });

    it('processes correctly standby slice without comment', () => {
      const slice = {
        typ: 'STANDBY',
        cId: 0,
      };
      const result = processSlice({ slice, commentsMap: {}, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'NO_SHIFT',
        sliceColor: colorConstants.dark.black,
      });
    });

    it('processes correctly standby slice with comment that is included in oee', () => {
      const slice = {
        typ: 'STANDBY',
        cId: 7,
        inOee: true,
      };
      const result = processSlice({ slice, commentsMap: { 7: { name: 'test comment' } }, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'STANDBY_INCL_OEE',
        sliceLabel: 'test comment',
        sliceColor: colorConstants.dark['secondary-dark'],
      });
    });

    it('processes correctly standby slice with comment thats excluded from oee', () => {
      const slice = {
        typ: 'STANDBY',
        cId: 7,
        inOee: false,
      };
      const result = processSlice({ slice, commentsMap: { 7: { name: 'test comment' } }, timezone: 'Europe/Tallinn' });

      expect(result).toEqual({
        ...slice,
        processedType: 'STANDBY_EXCL_OEE',
        sliceLabel: 'test comment',
        sliceColor: colorConstants.dark['lw-gray'],
      });
    });
  });

  describe('addSlice', () => {
    it('adds PRODUCT_SLOW_COMMENTED as two slices', () => {
      const slice = {
        typ: 'PRODUCT',
        processedType: 'PRODUCT_SLOW_COMMENTED',
        stTmISO: '2025-01-24T12:47:45.000+02:00',
        enTmISO: '2025-01-24T12:49:45.000+02:00',
        gDur: 60,
      };

      const result = { timeline: [] };
      const timezone = 'Europe/Tallinn';

      addSlice(slice, result, timezone);

      expect(result.timeline.length).toBe(2);
      expect(result.timeline[0]).toEqual({
        ...slice,
        enTmISO: '2025-01-24T12:48:45.000+02:00',
        stTmISO: '2025-01-24T12:47:45.000+02:00',
      });
      expect(result.timeline[1]).toEqual({
        ...slice,
        stTmISO: '2025-01-24T12:48:45.000+02:00',
        enTmISO: '2025-01-24T12:49:45.000+02:00',
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
    });

    it('adds PRODUCT_SLOW_UNCOMMENTED as two slices', () => {
      const slice = {
        typ: 'PRODUCT',
        processedType: 'PRODUCT_SLOW_UNCOMMENTED',
        stTmISO: '2025-01-24T12:47:45.000+02:00',
        enTmISO: '2025-01-24T12:49:45.000+02:00',
        gDur: 60,
      };

      const result = { timeline: [{ type: 'PRODUCT' }] };
      const timezone = 'Europe/Tallinn';

      addSlice(slice, result, timezone);

      expect(result.timeline.length).toBe(3);
      expect(result.timeline[1]).toEqual({
        ...slice,
        enTmISO: '2025-01-24T12:48:45.000+02:00',
        stTmISO: '2025-01-24T12:47:45.000+02:00',
      });
      expect(result.timeline[2]).toEqual({
        ...slice,
        stTmISO: '2025-01-24T12:48:45.000+02:00',
        enTmISO: '2025-01-24T12:49:45.000+02:00',
        sliceColor: colorConstants.dark['lw-green'],
        processedType: 'PRODUCT_FAST',
      });
    });

    it('adds other slices as one slice', () => {
      const slice = {
        typ: 'PRODUCT',
      };
      const result = { timeline: [] };

      addSlice(slice, result, 'Europe/Tallinn');
      expect(result.timeline.length).toBe(1);
      expect(result.timeline[0]).toEqual(slice);
    });
  });
  describe('processTimeline', () => {
    test('that processTimeline sums consequent products slice quantities', () => {
      const timeline = [
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:00:00.000Z', enTmISO: '2022-01-01T01:00:00.000Z', qty: 7, aQty: 14,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T01:00:00.000Z', enTmISO: '2022-01-01T02:00:00.000Z', qty: 6, aQty: 12,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T02:00:00.000Z', enTmISO: '2022-01-01T03:00:00.000Z', qty: 8, aQty: 16,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T03:00:00.000Z', enTmISO: '2022-01-01T10:00:00.000Z', qty: 9, aQty: 18,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T10:00:00.000Z', enTmISO: '2022-01-01T12:00:00.000Z', qty: 4, aQty: 8,
        },
      ];
      const result = processTimeline({ data: { timeline, startTimeISO: '2022-01-01T00:00:00.000Z', endTimeISO: '2022-01-01T12:00:00.000Z' } }, {});
      expect(result.timeline.length).toBe(1);
      const firstSlice = result.timeline[0];
      expect(firstSlice.stTmISO).toBe('2022-01-01T00:00:00.000Z');
      expect(firstSlice.enTmISO).toBe('2022-01-01T12:00:00.000Z');
      expect(firstSlice.qty).toBe(34);
      expect(firstSlice.aQty).toBe(68);
    });

    test('that processTimeline returns different slices for different product slices', () => {
      const timeline = [
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:00:00.000Z', enTmISO: '2022-01-01T01:00:00.000Z', qty: 7, prId: 1, aQty: 14,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T01:00:00.000Z', enTmISO: '2022-01-01T02:00:00.000Z', qty: 6, prId: 1, aQty: 12,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T02:00:00.000Z', enTmISO: '2022-01-01T03:00:00.000Z', qty: 8, prId: 2, aQty: 8,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T03:00:00.000Z', enTmISO: '2022-01-01T10:00:00.000Z', qty: 9, prId: 2, aQty: 9,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T10:00:00.000Z', enTmISO: '2022-01-01T12:00:00.000Z', qty: 4, prId: 2, aQty: 4,
        },
      ];
      const result = processTimeline({ data: { timeline } }, {});
      expect(result.timeline.length).toBe(2);
      const firstSlice = result.timeline[0];
      expect(firstSlice.stTmISO).toBe('2022-01-01T00:00:00.000Z');
      expect(firstSlice.enTmISO).toBe('2022-01-01T02:00:00.000Z');
      expect(firstSlice.qty).toBe(13);
      expect(firstSlice.aQty).toBe(26);
      const secondSlice = result.timeline[1];
      expect(secondSlice.stTmISO).toBe('2022-01-01T02:00:00.000Z');
      expect(secondSlice.enTmISO).toBe('2022-01-01T12:00:00.000Z');
      expect(secondSlice.qty).toBe(21);
      expect(secondSlice.aQty).toBe(21);
    });

    test('that processTimeline has array of changeover slices', () => {
      const timeline = [
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:00:00.000Z', enTmISO: '2022-01-01T01:00:00.000Z', qty: 7, prId: 1, pChg: false,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T01:00:00.000Z', enTmISO: '2022-01-01T02:00:00.000Z', qty: 6, prId: 1, pChg: false,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T02:00:00.000Z', enTmISO: '2022-01-01T03:00:00.000Z', qty: 8, prId: 2, pChg: true,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T03:00:00.000Z', enTmISO: '2022-01-01T10:00:00.000Z', qty: 9, prId: 2, pChg: false,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T10:00:00.000Z', enTmISO: '2022-01-01T12:00:00.000Z', qty: 4, prId: 2, pChg: false,
        },
      ];
      const result = processTimeline({ data: { timeline } }, {});
      expect(result.changeovers.length).toBe(1);
    });

    it('returns correctly processed timeline', () => {
      const timeline = [
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:00:00.000Z', enTmISO: '2022-01-01T00:01:00.000Z', qty: 7, prId: 1, gDur: 60, plc: 0, aQty: 14,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:01:00.000Z', enTmISO: '2022-01-01T00:02:00.000Z', qty: 6, prId: 1, gDur: 60, plc: 0, aQty: 12,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:02:00.000Z', enTmISO: '2022-01-01T00:03:10.000Z', qty: 8, prId: 2, gDur: 60, plc: 0, pChg: true, aQty: 8,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T00:03:10.000Z', enTmISO: '2022-01-01T00:05:00.000Z', qty: 8, prId: 2, gDur: 60, plc: 0, aQty: 8,
        },
        {
          typ: 'STOPPAGE', stTmISO: '2022-01-01T03:05:00.000Z', enTmISO: '2022-01-01T04:00:00.000Z', cId: 1,
        },
        {
          typ: 'STOPPAGE', stTmISO: '2022-01-01T04:00:00.000Z', enTmISO: '2022-01-01T04:05:00.000Z', prId: 2, cId: 0,
        },
        {
          typ: 'STANDBY', stTmISO: '2022-01-01T04:05:00.000Z', enTmISO: '2022-01-01T07:00:00.000Z', cId: 0,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T07:00:00.000Z', enTmISO: '2022-01-01T07:02:00.000Z', qty: 4, prId: 2, gDur: 60, plc: 1, aQty: 4,
        },
        {
          typ: 'PRODUCT', stTmISO: '2022-01-01T07:02:00.000Z', enTmISO: '2022-01-01T07:03:00.000Z', qty: 4, prId: 2, gDur: 60, plc: 0, aQty: 4,
        },
        {
          typ: 'STANDBY', stTmISO: '2022-01-01T07:03:00.000Z', enTmISO: '2022-01-01T08:00:00.000Z', cId: 2, inOee: true,
        },
        {
          typ: 'STANDBY', stTmISO: '2022-01-01T08:03:00.000Z', enTmISO: '2022-01-01T09:00:00.000Z', cId: 3, inOee: false,
        },
      ];
      const commentsMap = {
        1: { id: 1, name: 'comment 1 - stoppage' },
        2: { id: 2, name: 'comment 2 - standby, included' },
        3: { id: 3, name: 'comment 3 - standby, excluded' },
      };
      const result = processTimeline({ data: { timeline, startTimeISO: '2022-01-01T00:00:00.000Z', endTimeISO: '2022-01-01T09:00:00.000Z' }, commentsMap, timezone: 'UTC' });
      expect(result.changeovers.length).toBe(1);
      expect(result.timeline.length).toBe(11);
      expect(result.timeline[0]).toEqual({ // 2 first product slices are combined
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T00:00:00.000Z',
        enTmISO: '2022-01-01T00:02:00.000Z',
        qty: 13,
        aQty: 26,
        prId: 1,
        gDur: 60,
        plc: 0,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
      expect(result.timeline[1]).toEqual({ // 3rd product slice
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T00:02:00.000Z',
        enTmISO: '2022-01-01T00:03:10.000Z',
        pChg: true,
        qty: 8,
        aQty: 8,
        prId: 2,
        gDur: 60,
        plc: 0,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
      expect(result.timeline[2]).toEqual({ // yellow of 4th slice
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T00:03:10.000Z',
        enTmISO: '2022-01-01T00:04:00.000Z',
        qty: 8,
        aQty: 8,
        prId: 2,
        gDur: 60,
        plc: 0,
        processedType: 'PRODUCT_SLOW_UNCOMMENTED',
        sliceColor: colorConstants.dark['lw-yellow'],
      });
      expect(result.timeline[3]).toEqual({ // green of 4th slice
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T00:04:00.000Z',
        enTmISO: '2022-01-01T00:05:00.000Z',
        qty: 8,
        aQty: 8,
        prId: 2,
        gDur: 60,
        plc: 0,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
      expect(result.timeline[4]).toEqual({ // 5th slice - stoppage with comment
        typ: 'STOPPAGE',
        stTmISO: '2022-01-01T03:05:00.000Z',
        enTmISO: '2022-01-01T04:00:00.000Z',
        cId: 1,
        processedType: 'STOPPAGE_COMMENTED',
        sliceColor: colorConstants.dark['lw-dark-red'],
        sliceLabel: 'comment 1 - stoppage',
      });
      expect(result.timeline[5]).toEqual({ // 6th slice - stoppage without comment
        typ: 'STOPPAGE',
        stTmISO: '2022-01-01T04:00:00.000Z',
        enTmISO: '2022-01-01T04:05:00.000Z',
        prId: 2,
        cId: 0,
        processedType: 'STOPPAGE_UNCOMMENTED',
        sliceColor: colorConstants.dark['lw-red'],
      });
      expect(result.timeline[6]).toEqual({ // 7th slice - standby without comment
        typ: 'STANDBY',
        stTmISO: '2022-01-01T04:05:00.000Z',
        enTmISO: '2022-01-01T07:00:00.000Z',
        cId: 0,
        processedType: 'NO_SHIFT',
        sliceColor: colorConstants.dark.black,
      });
      expect(result.timeline[7]).toEqual({ // 8th slice - yellow part
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T07:00:00.000Z',
        enTmISO: '2022-01-01T07:01:00.000Z',
        qty: 4,
        aQty: 4,
        prId: 2,
        gDur: 60,
        plc: 1,
        processedType: 'PRODUCT_SLOW_COMMENTED',
        sliceColor: colorConstants.dark['lw-orange'],
      });
      expect(result.timeline[8]).toEqual({ // green part of 8th slice + 9th slice
        typ: 'PRODUCT',
        stTmISO: '2022-01-01T07:01:00.000Z',
        enTmISO: '2022-01-01T07:03:00.000Z',
        qty: 8,
        aQty: 8,
        prId: 2,
        gDur: 60,
        plc: 1,
        processedType: 'PRODUCT_FAST',
        sliceColor: colorConstants.dark['lw-green'],
      });
      expect(result.timeline[9]).toEqual({ // 10th slice - standby with comment included in oee
        typ: 'STANDBY',
        stTmISO: '2022-01-01T07:03:00.000Z',
        enTmISO: '2022-01-01T08:00:00.000Z',
        cId: 2,
        inOee: true,
        processedType: 'STANDBY_INCL_OEE',
        sliceLabel: 'comment 2 - standby, included',
        sliceColor: colorConstants.dark['secondary-dark'],
      });
      expect(result.timeline[10]).toEqual({ // 11th slice - standby with comment excluded from oee
        typ: 'STANDBY',
        stTmISO: '2022-01-01T08:03:00.000Z',
        enTmISO: '2022-01-01T09:00:00.000Z',
        cId: 3,
        inOee: false,
        processedType: 'STANDBY_EXCL_OEE',
        sliceLabel: 'comment 3 - standby, excluded',
        sliceColor: colorConstants.dark['lw-gray'],
      });
    });
  });
});
