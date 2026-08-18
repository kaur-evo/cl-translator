import listToCommaSeparatedString from './listToCommaSeparatedString';

describe('listToCommaSeparatedString', () => {
  it('returns empty text, when list is undefined', () => {
    expect(listToCommaSeparatedString()).toStrictEqual('');
  });

  it('returns empty text, when list is empty', () => {
    expect(listToCommaSeparatedString([])).toStrictEqual('');
  });

  it('returns a text, when list has one item', () => {
    expect(listToCommaSeparatedString(['Item1'])).toStrictEqual('Item1');
  });

  it('returns a text, when list has multiple items', () => {
    expect(listToCommaSeparatedString(['Item1', 'Item2', 'Item3'])).toStrictEqual('Item1, Item2, Item3');
  });
});
