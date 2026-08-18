import { describe, it, expect } from 'vitest';

import { applyFittedFontSize } from './applyFittedFontSize';

const createMockElement = (clientWidth, scrollWidth) => ({
  clientWidth,
  scrollWidth,
  style: { fontSize: '', lineHeight: '' },
});

describe('applyFittedFontSize', () => {
  it('does not throw when element is null', () => {
    expect(() => applyFittedFontSize(null, 14, 48)).not.toThrow();
  });

  it('skips applying when minFontSize is null', () => {
    const el = createMockElement(200, 200);
    applyFittedFontSize(el, null, 48);
    expect(el.style.fontSize).toBe('');
  });

  it('skips applying when maxFontSize is null', () => {
    const el = createMockElement(200, 200);
    applyFittedFontSize(el, 14, null);
    expect(el.style.fontSize).toBe('');
  });

  it('keeps maxFontSize when text fits within container', () => {
    const el = createMockElement(200, 150);
    applyFittedFontSize(el, 14, 48);
    expect(el.style.fontSize).toBe('48px');
    expect(el.style.lineHeight).toBe('1');
  });

  it('keeps maxFontSize when scrollWidth equals clientWidth', () => {
    const el = createMockElement(200, 200);
    applyFittedFontSize(el, 14, 48);
    expect(el.style.fontSize).toBe('48px');
  });

  it('scales down when text overflows container', () => {
    // scrollWidth = 300, clientWidth = 200
    // fitted = Math.floor(48 * (200 / 300)) = Math.floor(32) = 32
    const el = createMockElement(200, 300);
    applyFittedFontSize(el, 14, 48);
    expect(el.style.fontSize).toBe('32px');
  });

  it('clamps to minFontSize when scaled value is too small', () => {
    // scrollWidth = 1000, clientWidth = 100
    // fitted = Math.floor(48 * (100 / 1000)) = 4 → clamped to 14
    const el = createMockElement(100, 1000);
    applyFittedFontSize(el, 14, 48);
    expect(el.style.fontSize).toBe('14px');
  });

  it('sets maxFontSize first to trigger measurement', () => {
    let capturedFontSize = '';
    const el = {
      style: { fontSize: '', lineHeight: '' },
      get scrollWidth() {
        capturedFontSize = this.style.fontSize;
        return 150;
      },
      clientWidth: 200,
    };
    applyFittedFontSize(el, 14, 96);
    expect(capturedFontSize).toBe('96px');
  });
});
