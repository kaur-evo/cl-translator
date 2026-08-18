import { describe, it, expect } from 'vitest';
import { mdiSquareRounded } from '@mdi/js';

import EventMarkerConfig from './EventMarkerConfig';

import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';
import { isModeVisible, isTargetVisible } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';

vi.mock('@/stores/reportsConfig/configurations/productionSpeedCommonFn', () => ({
  isModeVisible: vi.fn(),
  isTargetVisible: vi.fn(),
}));

vi.mock('@/helpers/getUnitIdFormatted', () => ({
  default: vi.fn(),
}));

describe('EventMarkerConfig', () => {
  const chartLegendState = [];
  const eventMarkerConfig = new EventMarkerConfig(chartLegendState);

  it('should return correct color for target visible', () => {
    isTargetVisible.mockReturnValue(true);
    isModeVisible.mockReturnValue(false);
    const color = eventMarkerConfig.getColor({});
    expect(color).toBe(colorConstants.light.black);
  });

  it('should return correct color for mode visible', () => {
    isTargetVisible.mockReturnValue(false);
    isModeVisible.mockReturnValue(true);
    const color = eventMarkerConfig.getColor({});
    expect(color).toBe(graphColors['graph-blue']);
  });

  it('should return empty color for neither target nor mode visible', () => {
    isTargetVisible.mockReturnValue(false);
    isModeVisible.mockReturnValue(false);
    const color = eventMarkerConfig.getColor({});
    expect(color).toBe('');
  });

  it('should return correct yKey for mode visible', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(false);
    const yKey = eventMarkerConfig.getYKey({});
    expect(yKey).toBe('containsMode');
  });

  it('should return correct yKey for target visible', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(true);
    const yKey = eventMarkerConfig.getYKey({});
    expect(yKey).toBe('containsTarget');
  });

  it('should return empty yKey for neither target nor mode visible', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(false);
    const yKey = eventMarkerConfig.getYKey({});
    expect(yKey).toBe('');
  });

  it('should not show icon when mode is visible and target is not', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(false);
    const showIcon = eventMarkerConfig.showIcon({});
    expect(showIcon).toBe(false);
  });

  it('should not show icon when target is visible and mode is not', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(true);
    const showIcon = eventMarkerConfig.showIcon({});
    expect(showIcon).toBe(false);
  });

  it('should not show icon when neither target or mode is visible', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(false);
    const showIcon = eventMarkerConfig.showIcon({});
    expect(showIcon).toBe(false);
  });

  it('should show icon when both target and mode are visible', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(true);
    const showIcon = eventMarkerConfig.showIcon({});
    expect(showIcon).toBe(true);
  });

  it('should show label when mode is visible and target is not', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(false);
    const showLabel = eventMarkerConfig.showLabel({});
    expect(showLabel).toBe(true);
  });

  it('should show label when target is visible and mode is not', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(true);
    const showLabel = eventMarkerConfig.showLabel({});
    expect(showLabel).toBe(true);
  });

  it('should not show label when both target and mode are visible', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(true);
    const showLabel = eventMarkerConfig.showLabel({});
    expect(showLabel).toBe(false);
  });

  it('should return correct label for mode visible', () => {
    isModeVisible.mockReturnValue(true);
    isTargetVisible.mockReturnValue(false);
    getUnitIdFormatted.mockReturnValue('formattedUnitId');
    const label = eventMarkerConfig.getLabel({ modeLabel: 'Mode', groupBy: ['group'], unitId: 'unitId' });
    expect(label).toBe('Mode formattedUnitId');
  });

  it('should return correct label for target visible', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(true);
    getUnitIdFormatted.mockReturnValue('formattedUnitId');
    const label = eventMarkerConfig.getLabel({ targetLabel: 'Target', groupBy: ['group'], unitId: 'unitId' });
    expect(label).toBe('Target formattedUnitId');
  });

  it('should return empty label for neither target nor mode visible', () => {
    isModeVisible.mockReturnValue(false);
    isTargetVisible.mockReturnValue(false);
    const label = eventMarkerConfig.getLabel({});
    expect(label).toBe('');
  });

  it('should return correct configuration object', () => {
    const config = eventMarkerConfig.get();
    expect(config).toEqual({
      color: eventMarkerConfig.getColor,
      xKey: 'groupingKey',
      circleRadius: 9,
      strokeDash: 0,
      strokeWidth: 1,
      hoverEnabled: false,
      mirroredIcon: true,
      hasVerticalLine: true,
      yKey: eventMarkerConfig.getYKey,
      xScaleBandOffset: true,
      markerVerticalPosition: 'top',
      verticalOffset: 10,
      showIcon: eventMarkerConfig.showIcon,
      icon: [mdiSquareRounded, mdiSquareRounded],
      iconColor: [colorConstants.light.black, graphColors['graph-blue']],
      iconScaleVal: 0.75,
      showLabel: eventMarkerConfig.showLabel,
      label: eventMarkerConfig.getLabel,
    });
  });
});
