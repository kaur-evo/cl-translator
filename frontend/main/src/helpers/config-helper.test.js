import processConfig from './config-helper';

describe('processConfig', () => {
  test('processConfig with parsing', () => {
    const config = {
      'feature.draggable': 'true',
      'feature.resizable': 'false',
      testconfig: 'test',
      'feature.array': '[1, 2, 3]',
    };

    expect(processConfig(config)).toEqual({ draggable: true, resizable: false, array: [1, 2, 3] });
  });

  test('processConfig without parsing', () => {
    const config = {
      'feature.draggable': 'not-a-boolean',
      'feature.array': 'not-an-array',
    };

    expect(processConfig(config)).toEqual({ draggable: 'not-a-boolean', array: 'not-an-array' });
  });
});
