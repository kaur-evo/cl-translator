import calcPercentage from './calcPercentage';

describe('calcPercentage', () => {
  it('should throw an error if fractionKey is not provided', () => {
    expect(() => calcPercentage({ total: 100 }, '', 'total')).toThrow('calcPercentage requires a fractionKey');
  });
  it('should throw an error if totalKey is not provided', () => {
    expect(() => calcPercentage({ fraction: 50 }, 'fraction', '')).toThrow('calcPercentage requires a totalKey');
  });
  it('should throw an error if fractionKey does not exist in the object', () => {
    expect(() => calcPercentage({ total: 100 }, 'fraction', 'total')).toThrow('calcPercentage requires a fractionKey that exists in the object');
  });
  it('should throw an error if totalKey does not exist in the object', () => {
    expect(() => calcPercentage({ fraction: 50 }, 'fraction', 'total')).toThrow('calcPercentage requires a totalKey that exists in the object');
  });
  it('should return 0 if totalKey is 0', () => {
    expect(calcPercentage({ fraction: 50, total: 0 }, 'fraction', 'total')).toBe(0);
  });
  it('should return the correct percentage', () => {
    expect(calcPercentage({ fraction: 50, total: 100 }, 'fraction', 'total')).toBe(0.5);
  });
  it('should return 0 if fractionKey is 0', () => {
    expect(calcPercentage({ fraction: 0, total: 100 }, 'fraction', 'total')).toBe(0);
  });
});
