import { stationHeader, formatListOfStrings } from './settingsTableHeaders';

describe('settingsTableHeaders', () => {
  describe('stationHeader', () => {
    it('should return an object with the correct properties - sortable and show empty array as all', () => {
      const result = stationHeader(true, true);
      expect(result).toMatchSnapshot();
    });

    it('should return an object with the correct properties - not sortable and show empty array as all', () => {
      const result = stationHeader(false, true);
      expect(result).toMatchSnapshot();
    });

    it('should return an object with the correct properties -  sortable and show empty array as empty', () => {
      const result = stationHeader(true, false);
      expect(result).toMatchSnapshot();
    });

    it('should return an object with the correct properties -  not sortable and show empty array as empty', () => {
      const result = stationHeader(false, false);
      expect(result).toMatchSnapshot();
    });
  });

  describe('formatListOfStrings', () => {
    it('should return a dash if the list is undefined', () => {
      const result = formatListOfStrings(undefined);
      expect(result).toEqual('-');
    });

    it('should return all if the list is empty and showEmptyAsAll is true', () => {
      const result = formatListOfStrings([], true);
      expect(result).toEqual('All');
    });

    it('should return a dash if the list is empty and showEmptyAsAll is false', () => {
      const result = formatListOfStrings([], false);
      expect(result).toEqual('-');
    });

    it('should return a comma separated string if the list has one item', () => {
      const result = formatListOfStrings(['one']);
      expect(result).toEqual('one');
    });

    it('should return a comma separated string if the list has multiple items', () => {
      const result = formatListOfStrings(['one', 'two', 'three']);
      expect(result).toEqual('one, two, three');
    });
  });
});
