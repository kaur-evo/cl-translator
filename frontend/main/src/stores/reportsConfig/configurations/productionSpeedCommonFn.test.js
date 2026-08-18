import { describe, it, expect } from 'vitest';

import { isModeVisible, isTargetVisible, areRequiredFiltersValid } from './productionSpeedCommonFn';

import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';

describe('productionSpeedCommonFn', () => {
  describe('isModeVisible', () => {
    it('should return true if entry contains mode and chartLegendState includes MOST_FREQUENT', () => {
      const entry = { containsMode: true };
      const chartLegendState = [productionSpeedLegendType.MOST_FREQUENT];
      expect(isModeVisible(entry, chartLegendState)).toBe(true);
    });

    it('should return false if entry does not contain mode', () => {
      const entry = { containsMode: false };
      const chartLegendState = [productionSpeedLegendType.MOST_FREQUENT];
      expect(isModeVisible(entry, chartLegendState)).toBe(false);
    });

    it('should return false if chartLegendState does not include MOST_FREQUENT', () => {
      const entry = { containsMode: true };
      const chartLegendState = [];
      expect(isModeVisible(entry, chartLegendState)).toBe(false);
    });
  });

  describe('isTargetVisible', () => {
    it('should return true if entry contains target and chartLegendState includes TARGET_SPEED', () => {
      const entry = { containsTarget: true };
      const chartLegendState = [productionSpeedLegendType.TARGET_SPEED];
      expect(isTargetVisible(entry, chartLegendState)).toBe(true);
    });

    it('should return false if entry does not contain target', () => {
      const entry = { containsTarget: false };
      const chartLegendState = [productionSpeedLegendType.TARGET_SPEED];
      expect(isTargetVisible(entry, chartLegendState)).toBe(false);
    });

    it('should return false if chartLegendState does not include TARGET_SPEED', () => {
      const entry = { containsTarget: true };
      const chartLegendState = [];
      expect(isTargetVisible(entry, chartLegendState)).toBe(false);
    });
  });

  describe('areRequiredFiltersValid', () => {
    it('should return true if stationId and productId are valid', () => {
      const requestFilterState = {
        stationId: ['station1'],
        productId: ['product1'],
      };
      expect(areRequiredFiltersValid(requestFilterState)).toBe(true);
    });

    it('should return false if stationId is invalid', () => {
      const requestFilterState = {
        stationId: [],
        productId: ['product1'],
      };

      expect(areRequiredFiltersValid(requestFilterState)).toBe(false);
    });

    it('should return false if productId is invalid', () => {
      const requestFilterState = {
        stationId: ['station1'],
        productId: [],
      };
      expect(areRequiredFiltersValid(requestFilterState)).toBe(false);
    });

    it('should return false if both stationId and productId are invalid', () => {
      const requestFilterState = {
        stationId: [],
        productId: [],
      };
      expect(areRequiredFiltersValid(requestFilterState)).toBe(false);
    });
  });
});
