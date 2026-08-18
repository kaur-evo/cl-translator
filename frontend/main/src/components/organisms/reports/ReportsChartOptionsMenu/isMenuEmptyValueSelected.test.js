import isMenuEmptyValueSelected from './isMenuEmptyValueSelected';

describe('isMenuEmptyValueSelected', () => {
  it('should return true when menuItemValue is "null" and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected('null', undefined)).toBe(true);
  });

  it('should return true when menuItemValue is "undefined" and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected('undefined', undefined)).toBe(true);
  });

  it('should return true when menuItemValue is an empty string and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected('', undefined)).toBe(true);
  });

  it('should return true when menuItemValue is "null" and selectedStateValue is not undefined', () => {
    expect(isMenuEmptyValueSelected('null', 'someValue')).toBe(true);
  });

  it('should return false when menuItemValue is a non-empty string and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected('someValue', undefined)).toBe(false);
  });

  it('should return false when menuItemValue is a non-empty string and selectedStateValue is not undefined', () => {
    expect(isMenuEmptyValueSelected('someValue', 'anotherValue')).toBe(false);
  });

  it('should return true when menuItemValue is null and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected(null, undefined)).toBe(true);
  });

  it('should return true when menuItemValue is undefined and selectedStateValue is undefined', () => {
    expect(isMenuEmptyValueSelected(undefined, undefined)).toBe(true);
  });
});
