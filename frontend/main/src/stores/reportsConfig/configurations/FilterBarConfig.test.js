import { createTestingPinia } from '@pinia/testing';

import { createFilterConfiguration, onProductionSpeedProductChangeBeforeApply, onProductionSpeedStationChange, getProductSecondaryText } from './FilterBarConfig';

import configType from '@/stores/reportsConfig/constants/configType';
import routesApi from '@/api/routesApi';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import { useFilterbarStore } from '@/stores';

vi.mock('@/components/molecules/PeriodSelectionList/defaults');
vi.mock('@/api/routesApi');
vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key, params) => {
        if (key === '{count} batches' && params?.count !== undefined) {
          return `${params.count} batches`;
        }
        return key;
      }),
    },
  },
}));

routesApi.getRoutes = vi.fn();

const setupFilterbarStore = (filterbarState = {}) => {
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: { filterbar: filterbarState },
  });
  return useFilterbarStore();
};

describe('FilterBarConfig', () => {
  Object.values(configType).forEach((type) => {
    it(`returns expected snapshot of configuration for ${type}`, () => {
      const configuration = createFilterConfiguration({ splitFilters: new Set(), disabledFilters: [] })(type);
      const configObject = Object.fromEntries(configuration);
      expect(configObject).toMatchSnapshot();
    });
  });

  describe('onProductionSpeedStationChange', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls updateFilterValue with correct groupBy when exactly one route is found', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });
      routesApi.getRoutes.mockResolvedValue([{ runTimeType: 'runTimeType1' }]);

      await onProductionSpeedStationChange({ value: [1] });

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ groupBy: ['runTimeType1'] });
    });

    it('does not call updateFilterValue when routes array is empty', async () => {
      // When no routes are found, we do nothing - user will see no data and can manually fix
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });
      routesApi.getRoutes.mockResolvedValue([]);

      await onProductionSpeedStationChange({ value: [1] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when stationIds array is empty', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });

      await onProductionSpeedStationChange({ value: [] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
      expect(routesApi.getRoutes).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when multiple stationIds are selected', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });

      await onProductionSpeedStationChange({ value: [1, 2] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
      expect(routesApi.getRoutes).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when productIds array is empty', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [] },
      });

      await onProductionSpeedStationChange({ value: [1] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
      expect(routesApi.getRoutes).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when multiple productIds are selected', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1, 2] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1, 2] },
      });

      await onProductionSpeedStationChange({ value: [1] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
      expect(routesApi.getRoutes).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when multiple routes are found', async () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });
      routesApi.getRoutes.mockResolvedValue([
        { runTimeType: 'runTimeType1' },
        { runTimeType: 'runTimeType2' },
      ]);

      await onProductionSpeedStationChange({ value: [1] });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully without breaking filter flow', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
        requestFilterState: { [queryParam.STATION_ID]: [1], [queryParam.PRODUCT_ID]: [1] },
      });
      routesApi.getRoutes.mockRejectedValue(new Error('Network timeout'));

      await onProductionSpeedStationChange({ value: [1] });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch routes'),
        expect.any(Error),
      );
      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('onProductionSpeedProductChangeBeforeApply', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls updateFilterValue with correct groupBy when runTimeType is found', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], groupBy: [] },
      });
      const item = { runTimeTypesByStationId: { 1: 'UNIT_PER_MINUTE' } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ groupBy: ['UNIT_PER_MINUTE'] });
    });

    it('does not call updateFilterValue when stationIds array is empty', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [], groupBy: [] },
      });
      const item = { runTimeTypesByStationId: { 1: 'UNIT_PER_MINUTE' } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when multiple stationIds are selected', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1, 2], groupBy: [] },
      });
      const item = { runTimeTypesByStationId: { 1: 'UNIT_PER_MINUTE', 2: 'UNIT_PER_HOUR' } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when stationIds is undefined', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { groupBy: [] },
      });
      const item = { runTimeTypesByStationId: { 1: 'UNIT_PER_MINUTE' } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when runTimeTypesByStationId is missing', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], groupBy: [] },
      });

      onProductionSpeedProductChangeBeforeApply({ item: {} });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when item is null', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], groupBy: [] },
      });

      onProductionSpeedProductChangeBeforeApply({ item: null });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('does not call updateFilterValue when groupBy already matches runTimeType (equality check)', () => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], groupBy: ['UNIT_PER_MINUTE'] },
      });
      const item = { runTimeTypesByStationId: { 1: 'UNIT_PER_MINUTE' } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it.each([
      'UNIT_PER_SECOND',
      'SECOND_PER_UNIT',
      'UNIT_PER_MINUTE',
      'UNIT_PER_HOUR',
    ])('handles runTimeType %s correctly', (runTimeType) => {
      const filterbarStore = setupFilterbarStore({
        currentFilterState: { [queryParam.STATION_ID]: [1], groupBy: [] },
      });
      const item = { runTimeTypesByStationId: { 1: runTimeType } };

      onProductionSpeedProductChangeBeforeApply({ item });

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ groupBy: [runTimeType] });
    });
  });

  describe('createFilterConfiguration with disabledFilters', () => {
    it('removes PRODUCTION_ORDER filter when in disabledFilters', () => {
      const config = createFilterConfiguration({
        splitFilters: new Set(),
        disabledFilters: [queryParam.PRODUCTION_ORDER],
      });
      const downtimeConfig = config(configType.DOWNTIME);
      expect(downtimeConfig.has(queryParam.PRODUCTION_ORDER)).toBe(false);
      expect(downtimeConfig.has(queryParam.LOT_CODE)).toBe(true);
    });

    it('removes LOT_CODE filter when in disabledFilters', () => {
      const config = createFilterConfiguration({
        splitFilters: new Set(),
        disabledFilters: [queryParam.LOT_CODE],
      });
      const downtimeConfig = config(configType.DOWNTIME);
      expect(downtimeConfig.has(queryParam.LOT_CODE)).toBe(false);
      expect(downtimeConfig.has(queryParam.PRODUCTION_ORDER)).toBe(true);
    });

    it('includes both filters when disabledFilters is empty', () => {
      const config = createFilterConfiguration({
        splitFilters: new Set(),
        disabledFilters: [],
      });
      const downtimeConfig = config(configType.DOWNTIME);
      expect(downtimeConfig.has(queryParam.PRODUCTION_ORDER)).toBe(true);
      expect(downtimeConfig.has(queryParam.LOT_CODE)).toBe(true);
    });
  });

  describe('LOT_CODE and PRODUCTION_ORDER filter configs', () => {
    let filterConfig;

    beforeEach(() => {
      const config = createFilterConfiguration({
        splitFilters: new Set(),
        disabledFilters: [],
      });
      filterConfig = config(configType.DOWNTIME);
    });

    describe('LOT_CODE', () => {
      it('has backendFilteringConfig with lotcodes entity', () => {
        const lotFilter = filterConfig.get(queryParam.LOT_CODE);
        expect(lotFilter.backendFilteringConfig.entity).toBe('lotcodes');
      });

      it('is removable', () => {
        const lotFilter = filterConfig.get(queryParam.LOT_CODE);
        expect(lotFilter.removable).toBe(true);
      });

      it('supports selection inversion', () => {
        const lotFilter = filterConfig.get(queryParam.LOT_CODE);
        expect(lotFilter.useSelectionInversion).toBe(true);
      });
    });

    describe('PRODUCTION_ORDER', () => {
      it('has backendFilteringConfig with productionorders entity', () => {
        const orderFilter = filterConfig.get(queryParam.PRODUCTION_ORDER);
        expect(orderFilter.backendFilteringConfig.entity).toBe('productionorders');
      });

      it('is removable', () => {
        const orderFilter = filterConfig.get(queryParam.PRODUCTION_ORDER);
        expect(orderFilter.removable).toBe(true);
      });

      it('supports selection inversion', () => {
        const orderFilter = filterConfig.get(queryParam.PRODUCTION_ORDER);
        expect(orderFilter.useSelectionInversion).toBe(true);
      });
    });
  });

  describe('getProductSecondaryText', () => {
    it('returns formatted string with batch count and sku when includeBatchData is true', () => {
      const entry = {
        batchCount: 5,
        sku: 'TEST-SKU-001',
      };

      const getSecondaryText = getProductSecondaryText(true);
      const result = getSecondaryText(entry);

      expect(result).toBe('5 batches | TEST-SKU-001');
    });

    it('returns only sku when includeBatchData is false', () => {
      const entry = {
        batchCount: 5,
        sku: 'TEST-SKU-002',
      };

      const getSecondaryText = getProductSecondaryText(false);
      const result = getSecondaryText(entry);

      expect(result).toBe('TEST-SKU-002');
    });

    it('formats correctly with zero batch count when includeBatchData is true', () => {
      const entry = {
        batchCount: 0,
        sku: 'TEST-SKU-003',
      };

      const getSecondaryText = getProductSecondaryText(true);
      const result = getSecondaryText(entry);

      expect(result).toBe('0 batches | TEST-SKU-003');
    });

    it('handles empty sku when includeBatchData is true', () => {
      const entry = {
        batchCount: 10,
        sku: '',
      };

      const getSecondaryText = getProductSecondaryText(true);
      const result = getSecondaryText(entry);

      expect(result).toBe('10 batches | ');
    });
  });
});
