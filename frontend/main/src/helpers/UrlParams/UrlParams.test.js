import URLParams from '.';

describe('URLParams', () => {
  describe('constructor', () => {
    beforeEach(() => {
      window.location.hash = '#/test?foo=bar';
    });

    afterEach(() => {
      window.location.hash = '';
    });

    it('merges parsed query string with object input when options.merge is true', () => {
      const inputObj = { baz: 'qux' };
      const urlParams = new URLParams(inputObj, { merge: true });
      expect(urlParams.getParams()).toEqual({
        foo: 'bar',
        baz: 'qux',
      });
    });

    it('uses only object input when options.merge is false', () => {
      const inputObj = { baz: 'qux' };
      const urlParams = new URLParams(inputObj, { merge: false });
      expect(urlParams.getParams()).toEqual({
        baz: 'qux',
      });
    });
  });

  describe('URL encoding', () => {
    it('should work', () => {
      const urlParams = new URLParams({
        foo: 'bar',
        baz: 'qux',
        arr: [1, 2],
      });
      const encodedString = urlParams.asHashString();
      expect(encodedString).toBe('?foo=bar&baz=qux&arr%5B%5D=%5B1,2%5D');
    });
    it('should escape reserved chars', () => {
      const urlParams = new URLParams({
        a: '*()!',
      });
      const encodedString = urlParams.asHashString();
      expect(encodedString).toBe('?a=%2a%28%29%21');
    });
    it('should preserve commas', () => {
      const urlParams = new URLParams({
        list: '1,2,3',
      });
      const encodedString = urlParams.asHashString();
      expect(
        encodedString,
      ).toBe('?list=1,2,3');
    });
    it('should use given base', () => {
      const urlParams = new URLParams({
        list: '1,2,3',
      }, { hashBase: 'test/base' });
      const encodedString = urlParams.asHashString();
      expect(
        encodedString,
      ).toBe('test/base?list=1,2,3');
    });
  });
  describe('URL parsing', () => {
    it('should work', () => {
      const urlParams = new URLParams('?foo=bar&baz=qux&arr%5B%5D=%5B1,2%5D');
      expect(urlParams).toStrictEqual(new URLParams({
        foo: 'bar',
        baz: 'qux',
        arr: [1, 2],
      }));
    });
    it('should parse null correctly', () => {
      const urlParams = new URLParams('?foo&bar=&arr%5B%5D=%5B1,null,3%5D');
      expect(urlParams).toStrictEqual(new URLParams({
        foo: null,
        bar: '',
        arr: [1, null, 3],
      }));
    });
    it('should parse reserved chars correctly', () => {
      const urlParams = new URLParams('?a=%2a%28%29%21');
      expect(urlParams).toStrictEqual(new URLParams({
        a: '*()!',
      }));
    });
    it('should parse commas correctly', () => {
      const urlParams = new URLParams('?list=1,2,3');
      expect(urlParams).toStrictEqual(new URLParams({
        list: '1,2,3',
      }));
    });
  });

  test('getParams', () => {
    const urlParams = new URLParams('?foo=bar&baz=qux&arr%5B%5D=%5B1,2%5D');
    expect(urlParams.getParams()).toEqual({
      foo: 'bar',
      baz: 'qux',
      arr: [1, 2],
    });
  });

  test('get key', () => {
    const urlParams = new URLParams('?foo=bar&baz=qux&arr%5B%5D=%5B1,2%5D');
    expect(urlParams.get('foo')).toBe('bar');
    expect(urlParams.get('baz')).toBe('qux');
    expect(urlParams.get('arr')).toEqual([1, 2]);
    expect(urlParams.get('nonexistent')).toBe(undefined);
  });

  test('set key', () => {
    const urlParams = new URLParams('?foo=bar&baz=qux&arr%5B%5D=%5B1,2%5D');
    urlParams.set('foo', 'newBar');
    urlParams.set('newKey', 'newValue');
    expect(urlParams.get('foo')).toBe('newBar');
    expect(urlParams.get('newKey')).toBe('newValue');
  });
});
