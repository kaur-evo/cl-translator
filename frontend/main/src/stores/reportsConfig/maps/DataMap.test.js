import DataMapper from './DataMap';

describe('DataMapper', () => {
  test('if getKeyValue returns item key value when key exists', () => {
    const dataMapper = new DataMapper({ id: 99 });
    const ret = dataMapper.getKeyValue('id');
    expect(ret).toStrictEqual(99);
  });
  test('if getKeyValue returns null when key does not exist', () => {
    const dataMapper = new DataMapper();
    const ret = dataMapper.getKeyValue('id');
    expect(ret).toStrictEqual(null);
  });
  test('if unformatted mapping works correctly', () => {
    const dataMapper = new DataMapper({ commentName: 'test' });
    dataMapper.listableKeys = ['entityName'];
    dataMapper.keyDefaults = new Map([['entityName', 'commentName']]);
    dataMapper.getUnformatted();
    expect(dataMapper.unformattedObj).toStrictEqual({ entityName: 'test' });
  });
  test('if formatted mapping works correctly', () => {
    const dataMapper = new DataMapper({ commentName: 'test' });
    dataMapper.keyDefaults = new Map([['entityName', 'commentName']]);
    dataMapper.formatDefaults = new Map([['entityName', (val) => `--${val}--`]]);
    dataMapper.getFormatted();
    expect(dataMapper.formattedObj).toStrictEqual({ entityName: '--test--' });
  });
});
