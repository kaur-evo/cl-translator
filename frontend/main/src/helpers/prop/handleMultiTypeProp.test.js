import handleMultiTypeProp from './handleMultiTypeProp';

describe('handleMultiTypeProp', () => {
  test('if function prop returns function`s value with entity input', () => {
    const objInputResult = handleMultiTypeProp({ value: 'result' }, (entity) => entity.value, '');
    expect(objInputResult).toBe('result');
    const listInputResult = handleMultiTypeProp(['res', 'ult'], (entity) => entity.join(''), '');
    expect(listInputResult).toBe('result');
    const stringInputResult = handleMultiTypeProp('rEsUlT', (entity) => entity.toLowerCase(), '');
    expect(stringInputResult).toBe('result');
  });
  test('if string prop returns object`s matching key', () => {
    const stringInputResult = handleMultiTypeProp({ value: 'result' }, 'value', '');
    expect(stringInputResult).toBe('result');
  });
  test('if string prop returns fallback if entity is not an object and fallback is set', () => {
    const stringInputResult = handleMultiTypeProp('rEsUlT', 'value', 'result');
    expect(stringInputResult).toBe('result');
  });
  it('returns entity if it is string and no other reasonable options or fallback', () => {
    const stringInputResult = handleMultiTypeProp('result', 'value', '');
    expect(stringInputResult).toBe('result');
  });
  it('returns fallback if all else fails', () => {
    const stringInputResult = handleMultiTypeProp({ value: 'result' }, null, 'result');
    expect(stringInputResult).toBe('result');
  });
});
