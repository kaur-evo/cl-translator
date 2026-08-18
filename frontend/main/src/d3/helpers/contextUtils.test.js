import { passContext, setContextKey } from './contextUtils';

describe('contextUtils', () => {
  describe('passContext', () => {
    it('should assign specified keys from context to instance', () => {
      const context = { a: 1, b: 2 };
      const instance = {};
      passContext(context, instance, ['a', 'b']);
      expect(instance).toEqual({ a: 1, b: 2 });
    });

    it('should throw an error if a key is not defined in context', () => {
      const context = { a: 1 };
      const instance = {};
      expect(() => passContext(context, instance, ['a', 'b'])).toThrow('b is not defined in context');
    });
  });

  describe('setContextKey', () => {
    it('should set the value of a key in the context', () => {
      const context = { a: 1 };
      setContextKey(context, 'a', 42);
      expect(context.a).toBe(42);
    });

    it('should throw an error if the key is not defined in context', () => {
      const context = { a: 1 };
      expect(() => setContextKey(context, 'b', 42)).toThrow('b is not defined in context');
    });
  });
});
