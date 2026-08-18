import getTextColorFromBrightness from './getTextColorFromBrightness';

describe('getTextColorFromBrightness', () => {
  it('returns black for white color', () => {
    const hex = '#FFFFFF';
    const textColor = getTextColorFromBrightness(hex);
    expect(textColor).toBe('#000');
  });

  it('returns white for black color', () => {
    const hex = '#000000';
    const textColor = getTextColorFromBrightness(hex);
    expect(textColor).toBe('#FFF');
  });

  it('returns black for a color with medium brightness', () => {
    const hex = '#808080';
    const textColor = getTextColorFromBrightness(hex);
    expect(textColor).toBe('#000');
  });

  it('returns white for a color with low brightness', () => {
    const hex = '#333333';
    const textColor = getTextColorFromBrightness(hex);
    expect(textColor).toBe('#FFF');
  });

  it('returns black for a color with high brightness', () => {
    const hex = '#CCCCCC';
    const textColor = getTextColorFromBrightness(hex);
    expect(textColor).toBe('#000');
  });
});
