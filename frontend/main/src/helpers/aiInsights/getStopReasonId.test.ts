import { describe, it, expect } from 'vitest';

import { getStopReasonId } from './getStopReasonId';

describe('getStopReasonId', () => {
  it('returns commentId as number when present', () => {
    expect(getStopReasonId({ commentId: 42 })).toBe(42);
  });

  it('returns entityId as number when commentId is missing', () => {
    expect(getStopReasonId({ entityId: 7 })).toBe(7);
  });

  it('prefers commentId over entityId', () => {
    expect(getStopReasonId({ commentId: 10, entityId: 20 })).toBe(10);
  });

  it('handles string numeric values', () => {
    expect(getStopReasonId({ commentId: '42' })).toBe(42);
  });

  it('returns null when both fields are missing', () => {
    expect(getStopReasonId({})).toBeNull();
  });

  it('returns null when both fields are undefined', () => {
    expect(getStopReasonId({ commentId: undefined, entityId: undefined })).toBeNull();
  });

  it('returns null for non-numeric string values', () => {
    expect(getStopReasonId({ commentId: 'abc' })).toBeNull();
  });

  it('returns null for NaN-producing inputs', () => {
    expect(getStopReasonId({ commentId: NaN })).toBeNull();
  });

  it('returns null for Infinity', () => {
    expect(getStopReasonId({ commentId: Infinity })).toBeNull();
  });

  it('falls back to entityId when commentId is 0 (0 is not a valid stop reason ID)', () => {
    expect(getStopReasonId({ commentId: 0, entityId: 7 })).toBe(7);
  });

  it('returns null for fractional commentId', () => {
    expect(getStopReasonId({ commentId: '1.5' })).toBeNull();
  });

  it('returns null for negative commentId', () => {
    expect(getStopReasonId({ commentId: -3 })).toBeNull();
  });

  it('returns null for zero entityId', () => {
    expect(getStopReasonId({ entityId: 0 })).toBeNull();
  });
});
