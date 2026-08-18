import {
  describe, it, expect, vi,
} from 'vitest';

import ReportsDataMapper from './ReportsDataMapper';

import { defaultLocalizationOptions } from '@/constants/formattingConstants';

describe('ReportsDataMapper', () => {
  it('should initialize with default values', () => {
    const mapper = new ReportsDataMapper({});
    expect(mapper.onCalcDataChange).toBeUndefined();
    expect(mapper.onLoadingChange).toBeUndefined();
    expect(mapper.isStacked).toEqual([true, true, true]);
    expect(mapper.usePagination).toBe(false);
    expect(mapper.formattingOptions).toEqual(defaultLocalizationOptions);
    expect(mapper.chartLegendState).toEqual([]);
  });

  it('should initialize with provided values', () => {
    const args = {
      onCalcDataChange: vi.fn(),
      onLoadingChange: vi.fn(),
      isStacked: false,
      usePagination: true,
      formattingOptions: { dateFormat: 'MM/DD/YYYY' },
      chartLegendState: ['legend1', 'legend2'],
    };
    const mapper = new ReportsDataMapper(args);
    expect(mapper.onCalcDataChange).toBe(args.onCalcDataChange);
    expect(mapper.onLoadingChange).toBe(args.onLoadingChange);
    expect(mapper.isStacked).toEqual([true, true, true]);
    expect(mapper.usePagination).toBe(true);
    expect(mapper.formattingOptions).toEqual(args.formattingOptions);
    expect(mapper.chartLegendState).toEqual(args.chartLegendState);
  });

  it('should calculate dataPctTotal correctly', () => {
    const mapper = new ReportsDataMapper({});
    mapper.data = [
      { stoppct: 10 },
      { performancelosspct: 20 },
      { stoppct: 30 },
    ];
    expect(mapper.dataPctTotal).toBe(60);
  });

  it('should set calculated data and call onCalcDataChange', () => {
    const onCalcDataChange = vi.fn();
    const mapper = new ReportsDataMapper({ onCalcDataChange });
    const inputObj = { data: [1, 2, 3] };
    mapper.setCalculatedData(inputObj);
    expect(mapper.data).toEqual(inputObj.data);
    expect(onCalcDataChange).toHaveBeenCalledWith(inputObj);
  });

  it('should manage loading state correctly', () => {
    const onLoadingChange = vi.fn();
    const mapper = new ReportsDataMapper({ onLoadingChange });
    mapper.setLoading(true);
    expect(mapper.loading.length).toBe(1);
    expect(onLoadingChange).toHaveBeenCalledWith(true);
    mapper.setLoading(false);
    expect(mapper.loading.length).toBe(0);
    expect(onLoadingChange).toHaveBeenCalledWith(false);
  });

  it('should get chart data and calculate it', () => {
    const mapper = new ReportsDataMapper({});
    const inputObj = { data: [{ value: 1 }], granularity: 'day' };
    vi.spyOn(mapper, 'calculateChartData').mockImplementation(() => {
      mapper.setCalculatedData({ data: inputObj.data });
    });
    const result = mapper.getChartData(inputObj);
    expect(result).toEqual(inputObj.data);
    expect(mapper.calculateChartData).toHaveBeenCalled();
  });

  it('should reorder data correctly', () => {
    const mapper = new ReportsDataMapper({});
    mapper.chartData = [
      { value: 3 },
      { value: 1 },
      { value: 2 },
    ];
    mapper.reOrderData({
      orderBy: 'value', orderDir: 'asc', page: 1, itemsPerPage: 3,
    });
    expect(mapper.data).toEqual([
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]);
  });

  it('should cancel calculateChartData correctly', async () => {
    const mapper = new ReportsDataMapper({});
    const cancelMock = vi.fn();
    vi.spyOn(window.WorkerService, 'process').mockReturnValue({
      then: () => ({ catch: () => ({ cancel: cancelMock }) }),
    });
    await mapper.calculateChartData();
    expect(cancelMock).toHaveBeenCalled();
  });
});
