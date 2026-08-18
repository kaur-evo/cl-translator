import groupByFilterRule from './improvementsGroupByFilterRule';

test('groupByFilterRule', () => {
  const list = [
    { name: 'John', age: 20 },
    { name: 'Jane', age: 30 },
    { name: 'James', age: 20 },
    { name: 'Mary', age: 50 },
  ];
  const groupBy = 'age';
  const ageOver10 = (item) => item.age > 10;
  const ageOver20 = (item) => item.age > 20;
  const ageOver30 = (item) => item.age > 30;
  const ageOver50 = (item) => item.age > 50;
  expect(groupByFilterRule({ list, groupBy, filterRule: ageOver10 }))
    .toEqual({ 20: [{ name: 'John', age: 20 }, { name: 'James', age: 20 }], 30: [{ name: 'Jane', age: 30 }], 50: [{ name: 'Mary', age: 50 }] });
  expect(groupByFilterRule({ list, groupBy, filterRule: ageOver20 })).toEqual({ 30: [{ name: 'Jane', age: 30 }], 50: [{ name: 'Mary', age: 50 }] });
  expect(groupByFilterRule({ list, groupBy, filterRule: ageOver30 })).toEqual({ 50: [{ name: 'Mary', age: 50 }] });
  expect(groupByFilterRule({ list, groupBy, filterRule: ageOver50 })).toEqual({});
});
