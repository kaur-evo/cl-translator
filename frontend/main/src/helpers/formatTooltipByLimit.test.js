import formatTooltipByLimit from './formatTooltipByLimit';

test('formatTooltipByLimit', () => {
  const tooltipValues = ['test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10'];
  const tooltipItemsLimit = 6;
  expect(formatTooltipByLimit(tooltipValues)).toBe('test1, test2, test3, test4, test5, test6, test7, test8, test9, test10');
  expect(formatTooltipByLimit(tooltipValues, tooltipItemsLimit)).toBe('test1, test2, test3, test4, test5, test6 + 4 selected');
});
