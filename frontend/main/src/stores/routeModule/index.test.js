import { setActivePinia, createPinia } from 'pinia';

import useRouteModuleStore from './index';

describe('useRouteModuleStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useRouteModuleStore();
  });

  test('initial state', () => {
    expect(store.query).toEqual({});
  });

  test('setQuery updates query state', () => {
    const query = { view: 'mobile', tab: 'overview' };
    store.setQuery(query);
    expect(store.query).toEqual(query);
  });

  test('setQuery replaces previous query', () => {
    store.setQuery({ foo: 'bar' });
    store.setQuery({ baz: 'qux' });
    expect(store.query).toEqual({ baz: 'qux' });
  });
});
