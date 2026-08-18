import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

import { getBatchTitle, getBatchTooltipRows, formatBatchTargetDisplay, formatBatchEstimatedTime, getBatchCardTitle, getBatchQuantityParts } from './batchHelpers';

import { useConfigurationStore, useUserPreferencesStore } from '@/stores';

describe('batchHelpers', () => {
  test('getBatchTitle', () => {
    expect(getBatchTitle({})).toBe('');
    expect(getBatchTitle({ productName: 'product name' })).toBe('product name');
    expect(getBatchTitle({ productSku: 'sku' })).toBe(' (sku)');
    expect(getBatchTitle({ productName: 'product name', productSku: 'sku' })).toBe('product name (sku)');
    expect(getBatchTitle({ productName: 'test string', productSku: 'test string' })).toBe('test string');
  });

  describe('getBatchTooltipRows', () => {
    const batch1 = {
      stationId: 1,
      startTime: '2023-03-10T13:23:00',
      productionOrder: '',
      unitQty: 1,
      unitId: 'tk',
      plannedQty: 100,
      notes: '',
      lotCode: '',
      scrapUnitQty: 1,
    };
    const batch2 = {
      stationId: 1,
      startTime: '2023-03-11T00:00:00',
      productionOrder: 'production order',
      unitQty: 2,
      unitId: 'l',
      plannedQty: 66,
      productionOrderSetupTime: 'setup time',
      notes: 'batch notes',
      lotCode: 'lot code',
      scrapUnitQty: 2,
    };
    const batch3 = {
      stationId: 1,
      startTime: '2023-03-11T00:00:00',
      productionOrder: 'production order',
      unitQty: 2.56789,
      unitId: 'l',
      plannedQty: 66.9999,
      productionOrderSetupTime: 'setup time',
      notes: 'batch notes',
      productionOrderNote: 'production order note',
      lotCode: 'lot code',
      scrapUnitQty: 2.56789,
    };

    const setProductBasedScrap = (value) => {
      setActivePinia(createTestingPinia({ createSpy: vi.fn, stubActions: false }));
      useConfigurationStore().configuration = { productBasedScrap: value };
    };

    describe('when productBasedScrap is enabled for the batch station', () => {
      beforeEach(() => setProductBasedScrap(true));

      it('includes the Scrap per one signal row', () => {
        expect(getBatchTooltipRows(batch1)).toEqual([
          { key: 'Start', value: '13:23' },
          { key: 'Order', value: '' },
          { key: 'Quantity per signal', value: '1 tk' },
          { key: 'Target', value: '100 tk' },
          { key: 'Scrap per one signal', value: '1 tk' },
          { key: 'Setup time', value: undefined },
          { key: 'LOT/Batch', value: '' },
          { key: 'Comment', value: undefined, allowTextWrap: true },
          { key: 'Extra note', value: '', allowTextWrap: true },
        ]);
        expect(getBatchTooltipRows(batch2)).toEqual([
          { key: 'Start', value: '00:00' },
          { key: 'Order', value: 'production order' },
          { key: 'Quantity per signal', value: '2 l' },
          { key: 'Target', value: '66 l' },
          { key: 'Scrap per one signal', value: '2 l' },
          { key: 'Setup time', value: 'setup time' },
          { key: 'LOT/Batch', value: 'lot code' },
          { key: 'Comment', value: undefined, allowTextWrap: true },
          { key: 'Extra note', value: 'batch notes', allowTextWrap: true },
        ]);
        expect(getBatchTooltipRows(batch3)).toEqual([
          { key: 'Start', value: '00:00' },
          { key: 'Order', value: 'production order' },
          { key: 'Quantity per signal', value: '2,56789 l' },
          { key: 'Target', value: '66,9999 l' },
          { key: 'Scrap per one signal', value: '2,56789 l' },
          { key: 'Setup time', value: 'setup time' },
          { key: 'LOT/Batch', value: 'lot code' },
          { key: 'Comment', value: 'production order note', allowTextWrap: true },
          { key: 'Extra note', value: 'batch notes', allowTextWrap: true },
        ]);
        expect(getBatchTooltipRows(batch1, '2023-03-10')).toEqual([
          { key: 'Start', value: '13:23' },
          { key: 'Order', value: '' },
          { key: 'Quantity per signal', value: '1 tk' },
          { key: 'Target', value: '100 tk' },
          { key: 'Scrap per one signal', value: '1 tk' },
          { key: 'Setup time', value: undefined },
          { key: 'LOT/Batch', value: '' },
          { key: 'Comment', value: undefined, allowTextWrap: true },
          { key: 'Extra note', value: '', allowTextWrap: true },
        ]);
        expect(getBatchTooltipRows(batch2, '2023-03-10')).toEqual([
          { key: 'Start', value: '00:00 - 11.03.2023' },
          { key: 'Order', value: 'production order' },
          { key: 'Quantity per signal', value: '2 l' },
          { key: 'Target', value: '66 l' },
          { key: 'Scrap per one signal', value: '2 l' },
          { key: 'Setup time', value: 'setup time' },
          { key: 'LOT/Batch', value: 'lot code' },
          { key: 'Comment', value: undefined, allowTextWrap: true },
          { key: 'Extra note', value: 'batch notes', allowTextWrap: true },
        ]);
      });

      it('includes the row when productBasedScrap station-id array includes the batch station', () => {
        setProductBasedScrap([1, 2, 3]);
        expect(getBatchTooltipRows(batch1)).toContainEqual({ key: 'Scrap per one signal', value: '1 tk' });
      });
    });

    describe('when productBasedScrap is disabled for the batch station', () => {
      it('sets the Scrap per one signal row value to null when config is false', () => {
        setProductBasedScrap(false);
        expect(getBatchTooltipRows(batch1)).toEqual([
          { key: 'Start', value: '13:23' },
          { key: 'Order', value: '' },
          { key: 'Quantity per signal', value: '1 tk' },
          { key: 'Target', value: '100 tk' },
          { key: 'Scrap per one signal', value: null },
          { key: 'Setup time', value: undefined },
          { key: 'LOT/Batch', value: '' },
          { key: 'Comment', value: undefined, allowTextWrap: true },
          { key: 'Extra note', value: '', allowTextWrap: true },
        ]);
      });

      it('sets the row value to null when config is null', () => {
        setProductBasedScrap(null);
        expect(getBatchTooltipRows(batch1)).toContainEqual({ key: 'Scrap per one signal', value: null });
      });

      it('sets the row value to null when the station-id array does not include the batch station', () => {
        setProductBasedScrap([2, 3]);
        expect(getBatchTooltipRows(batch1)).toContainEqual({ key: 'Scrap per one signal', value: null });
      });
    });
  });

  describe('formatBatchTargetDisplay', () => {
    beforeEach(() => {
      setActivePinia(createTestingPinia({ createSpy: vi.fn, stubActions: true }));
      useUserPreferencesStore().viewSettings = { usePrimaryUnit: true };
    });

    it('returns empty string when plannedQty is falsy', () => {
      expect(formatBatchTargetDisplay({ unitId: 'kg', plannedQty: 0 })).toBe('');
      expect(formatBatchTargetDisplay({ unitId: 'kg', plannedQty: null })).toBe('');
      expect(formatBatchTargetDisplay({ unitId: 'kg' })).toBe('');
    });

    it('returns formatted quantity with unit when plannedQty is set', () => {
      expect(formatBatchTargetDisplay({ unitId: 'kg', plannedQty: 100 })).toBe('100 kg');
      expect(formatBatchTargetDisplay({ unitId: 'l', plannedQty: 66.9999 })).toBe('66,9999 l');
    });
  });

  describe('formatBatchEstimatedTime', () => {
    it('returns empty string when estimatedTimeLeft is falsy', () => {
      expect(formatBatchEstimatedTime({ estimatedTimeLeft: 0 })).toBe('');
      expect(formatBatchEstimatedTime({ estimatedTimeLeft: null })).toBe('');
      expect(formatBatchEstimatedTime({})).toBe('');
    });

    it('returns formatted time string for given seconds', () => {
      expect(formatBatchEstimatedTime({ estimatedTimeLeft: 55 })).toBe('55s');
      expect(formatBatchEstimatedTime({ estimatedTimeLeft: 7200 })).toBe('2h 0m');
      expect(formatBatchEstimatedTime({ estimatedTimeLeft: 3660 })).toBe('1h 1m');
    });
  });

  describe('getBatchCardTitle', () => {
    it('uses productionOrder as label when available', () => {
      const batch = { startTime: '2023-03-10T13:23:00', productionOrder: 'PO-1', productName: 'Product1' };
      expect(getBatchCardTitle(batch)).toBe('13:23 — 10.03.2023 — PO-1');
    });

    it('falls back to productName when productionOrder is absent', () => {
      const batch = { startTime: '2023-03-10T13:23:00', productName: 'Product1' };
      expect(getBatchCardTitle(batch)).toBe('13:23 — 10.03.2023 — Product1');
    });
  });

  describe('getBatchQuantityParts', () => {
    it('returns goodQty as produced minus scrap', () => {
      const batch = { unitId: 'kg', producedQty: 90, scrapQty: 10 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.goodQty).toBe('80');
      expect(result.unitId).toBe('kg');
    });

    it('returns empty string when scrapQty is 0', () => {
      const batch = { unitId: 'kg', producedQty: 90, scrapQty: 0 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.scrapQty).toBe('');
    });

    it('returns formatted scrapQty when scrapQty is set', () => {
      const batch = { unitId: 'kg', producedQty: 90, scrapQty: 5 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.scrapQty).toBe('5');
    });

    it('returns empty string when plannedQty is 0', () => {
      const batch = { unitId: 'kg', producedQty: 90, scrapQty: 0, plannedQty: 0 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.plannedQty).toBe('');
    });

    it('returns formatted plannedQty without decimal rounding when set', () => {
      const batch = { unitId: 'l', producedQty: 50, scrapQty: 0, plannedQty: 66.9999 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.plannedQty).toBe('66,9999');
      expect(result.unitId).toBe('l');
    });

    it('returns goodQty and scrapQty with decimal rounding', () => {
      const batch = { unitId: 'l', producedQty: 66.9999, scrapQty: 1.5001, plannedQty: 100 };
      const result = getBatchQuantityParts(batch, false);
      expect(result.goodQty).toBe('65,5');
      expect(result.scrapQty).toBe('1,5');
    });
  });
});
