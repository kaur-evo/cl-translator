import { describe, it, expect, vi, beforeEach } from 'vitest';

import useHourAxis from './useHourAxis';

// Mocks
const mockDraw = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/d3/SimpleTimeAxis', () => ({
  default: vi.fn(() => ({
    draw: mockDraw,
    update: mockUpdate,
  })),
}));

vi.mock('@/stores/profile', () => ({
  default: () => ({
    language: 'en',
    currentUser: { timeFormat: 24 },
  }),
}));

vi.mock('vue', () => ({
  computed: (fn) => fn(),
}));

describe('useHourAxis', () => {
  let hourAxisRef;
  let scale;
  let tickFrequency;

  beforeEach(() => {
    hourAxisRef = { value: {} };
    scale = { value: {} };
    tickFrequency = { value: 2 };
    mockDraw.mockClear();
    mockUpdate.mockClear();
  });

  it('should return drawHourAxis and updateHourAxis functions', () => {
    const result = useHourAxis(hourAxisRef, scale, { tickFrequency });
    expect(typeof result.drawHourAxis).toBe('function');
    expect(typeof result.updateHourAxis).toBe('function');
  });

  it('should call draw on SimpleTimeAxis when drawHourAxis is called', () => {
    const { drawHourAxis } = useHourAxis(hourAxisRef, scale, { tickFrequency });
    drawHourAxis();
    expect(mockDraw).toHaveBeenCalled();
  });

  it('should not call draw if hourAxisRef.value is null', () => {
    hourAxisRef.value = null;
    const { drawHourAxis } = useHourAxis(hourAxisRef, scale, { tickFrequency });
    drawHourAxis();
    expect(mockDraw).not.toHaveBeenCalled();
  });

  it('should call update on SimpleTimeAxis when updateHourAxis is called after drawHourAxis', () => {
    const { drawHourAxis, updateHourAxis } = useHourAxis(hourAxisRef, scale, { tickFrequency });
    drawHourAxis();
    updateHourAxis();
    expect(mockUpdate).toHaveBeenCalledWith({ scale: expect.any(Object), tickFormat: expect.any(Function), ticks: expect.any(Function) });
  });

  it('should not call update if drawHourAxis was not called first', () => {
    const { updateHourAxis } = useHourAxis(hourAxisRef, scale, { tickFrequency });
    updateHourAxis();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
